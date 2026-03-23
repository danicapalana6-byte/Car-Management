module.exports = function(Feedback, Client) { // Use the Mongoose models
    const express = require('express');
    const mongoose = require('mongoose');
    const router = express.Router();

    // POST a new feedback
    router.post('/submit', async (req, res) => {
        try {
            const { user, email, rating, comment, booking, image, service } = req.body;

            // Basic validation
            if (!user || !rating || !comment) {
                return res.status(400).json({ message: 'User, rating, and comment are required.' });
            }

            const feedbackData = {
                user,
                email,
                rating,
                comment,
                service,
                image
            };

            if (booking && mongoose.Types.ObjectId.isValid(booking)) {
                feedbackData.booking = booking;
            }

            const newFeedback = new Feedback(feedbackData);

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
        const identifiers = [
            req.query.username,
            req.query.email,
            req.query.legacyUsername,
            req.query.legacyEmail
        ].filter(Boolean);
        if (identifiers.length === 0) {
            return res.status(400).json({ message: "Client identity is required." });
        }
        try {
            const clientFeedbacks = await Feedback.find({
                $or: identifiers.flatMap(value => ([{ user: value }, { email: value }]))
            }).sort({ createdAt: -1 });
            res.json(clientFeedbacks);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user feedbacks' });
        }
    });

    // DELETE a feedback by id for its owner
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        const identifiers = [
            req.query.username,
            req.query.email,
            req.query.legacyUsername,
            req.query.legacyEmail
        ].filter(Boolean);

        if (identifiers.length === 0) {
            return res.status(400).json({ message: "Client identity is required." });
        }

        try {
            const deletedFeedback = await Feedback.findOneAndDelete({
                _id: id,
                $or: identifiers.flatMap(value => ([{ user: value }, { email: value }]))
            });

            if (!deletedFeedback) {
                return res.status(404).json({ message: 'Feedback not found.' });
            }

            res.json({ message: 'Feedback removed successfully.' });
        } catch (error) {
            console.error("Failed to delete feedback:", error);
            res.status(500).json({ message: 'Error deleting feedback.' });
        }
    });

    return router;
};
