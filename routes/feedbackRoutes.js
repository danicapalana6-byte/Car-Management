module.exports = function(feedbacks, clients) {
    const express = require('express');
    const router = express.Router();
    const multer = require('multer');
    const path = require('path');

    // Set up storage for multer
    const storage = multer.diskStorage({
        destination: './public/uploads/feedbacks/',
        filename: function(req, file, cb){
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

    // Init upload
    const upload = multer({
        storage: storage,
        limits: {fileSize: 1000000}, // 1MB limit
        fileFilter: function(req, file, cb){
            checkFileType(file, cb);
        }
    }).single('photo');

    // Check file type
    function checkFileType(file, cb){
        // Allowed ext
        const filetypes = /jpeg|jpg|png|gif/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);

        if(mimetype && extname){
            return cb(null,true);
        } else {
            cb('Error: Images Only!');
        }
    }

    router.post('/submit', (req, res) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            const userId = bearerToken.split('-')[1]; 

            upload(req, res, (err) => {
                if(err){
                    res.status(400).json({ msg: err });
                } else {
                    const client = clients.find(c => c.id == userId);
                    if (!client) {
                        return res.status(404).json({ msg: 'Client not found' });
                    }

                    const newFeedback = {
                        id: Date.now(),
                        clientId: userId,
                        comments: req.body.comments,
                        photo: req.file ? `/uploads/feedbacks/${req.file.filename}` : null,
                        clientName: client.name,
                        createdAt: new Date()
                    };

                    feedbacks.push(newFeedback);
                    res.status(201).json(newFeedback);
                }
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.get('/my-feedbacks', (req, res) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            const userId = bearerToken.split('-')[1];

            const clientFeedbacks = feedbacks.filter(f => f.clientId === userId);
            res.json(clientFeedbacks);
        } else {
            res.sendStatus(403);
        }
    });

    return router;
};
