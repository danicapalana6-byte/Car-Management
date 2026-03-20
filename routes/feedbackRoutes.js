module.exports = function(Feedback, Client) { // Use the Mongoose models
    const express = require('express');
    const router = express.Router();

    // POST a new feedback
    router.post('/submit', async (req, res) => {
        try {
            const { user, rating, comment, booking, image } = req.body;

            // Basic validation
            if (!user || !rating || !comment) {
                return res.status(400).json({ message: 'User, rating, and comment are required.' });
            }

            const newFeedback = new Feedback({
                user,
                rating,
                comment,
                booking,
                image
            });

            await newFeedback.save();
            res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });

        } catch (error) {
            console.error("Failed to save feedback:", error);
            res.status(500).json({ message: 'Server error while submitting feedback.' });
        }
    });

    // GET all feedbacks (for admin or public display)
    router.get('/', async (req, res) => {
        try {
            const feedbacks = await Feedback.find().populate('booking').sort({ createdAt: -1 });
            res.json(feedbacks);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching feedbacks' });
        }
    });

    // GET feedbacks by a specific user
    router.get('/my-feedbacks', async (req, res) => {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ message: "Username is required." });
        }
        try {
            const clientFeedbacks = await Feedback.find({ user: username }).sort({ createdAt: -1 });
            res.json(clientFeedbacks);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user feedbacks' });
        }
    });

    return router;
};
