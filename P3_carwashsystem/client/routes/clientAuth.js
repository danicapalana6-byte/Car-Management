const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const passwordResetStore = new Map();
const DEV_RESET_CODE = process.env.DEV_RESET_CODE || "694953";

module.exports = function (Client, transporter) {
  router.post("/signup", async (req, res) => {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password)
      return res.status(400).json({ message: "All fields required." });

    try {
      const existingClient = await Client.findOne({
        $or: [{ email }, { username }],
      });
      if (existingClient) {
        return res.status(400).json({ message: "Email or username already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newClient = await Client.create({
        name,
        email,
        username,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: newClient._id,
          name: newClient.name,
          email: newClient.email,
          username: newClient.username,
        },
        token: "token-" + newClient._id,
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({
            message: "Registration failed: Email or username is already in use.",
          });
      }
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((e) => e.message)
          .join(", ");
        return res
          .status(400)
          .json({ message: "Validation Error: " + messages });
      }
      res
        .status(500)
        .json({ message: "Server error during registration.", error: error.message });
    }
  });

  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const client = await Client.findOne({ username });
        if (!client) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        res.json({ token: "token-" + client._id, name: client.name, username: client.username, email: client.email });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
  });

  router.post("/forgot-password/request", async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    try {
      const client = await Client.findOne({ email });
      if (!client) {
        return res.status(404).json({ message: "No account found for that email address." });
      }

      const code = (!transporter && process.env.NODE_ENV !== "production")
        ? DEV_RESET_CODE
        : `${Math.floor(100000 + Math.random() * 900000)}`;
      passwordResetStore.set(email, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      if (!transporter) {
        if (process.env.NODE_ENV === "production") {
          return res.status(500).json({ message: "Could not send reset code email right now." });
        }

        return res.json({
          message: "Reset code generated for local development.",
          devCode: code
        });
      }

      let mailError = null;
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "CarWash Pro Password Reset Code",
          html: `
            <h2>Password Reset Request</h2>
            <p>Hello ${client.name || client.username},</p>
            <p>Use this verification code to reset your CarWash Pro password:</p>
            <h1 style="letter-spacing: 4px;">${code}</h1>
            <p>This code will expire in 10 minutes.</p>
          `
        });
      } catch (error) {
        mailError = error;
        console.error("Forgot password request error:", error);
      }

      if (mailError && process.env.NODE_ENV !== "production") {
        return res.json({
          message: "Reset code generated for local development.",
          devCode: code
        });
      }

      if (mailError) {
        return res.status(500).json({ message: "Could not send reset code email right now." });
      }

      res.json({ message: "Reset code sent to your email address." });
    } catch (error) {
      console.error("Forgot password request error:", error);
      res.status(500).json({ message: "Could not send reset code right now." });
    }
  });

  router.post("/forgot-password/reset", async (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const code = (req.body.code || "").trim();
    const newPassword = req.body.newPassword || "";

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    try {
      const storedReset = passwordResetStore.get(email);
      if (!storedReset) {
        return res.status(400).json({ message: "No active reset request found for this email." });
      }

      if (storedReset.expiresAt < Date.now()) {
        passwordResetStore.delete(email);
        return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
      }

      if (storedReset.code !== code) {
        return res.status(400).json({ message: "Invalid reset code." });
      }

      const client = await Client.findOne({ email });
      if (!client) {
        passwordResetStore.delete(email);
        return res.status(404).json({ message: "Account not found." });
      }

      client.password = await bcrypt.hash(newPassword, 10);
      await client.save();
      passwordResetStore.delete(email);

      res.json({ message: "Password updated successfully. You can now log in." });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Could not reset password right now." });
    }
  });

  return router;
};
