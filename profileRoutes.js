module.exports = function(clients) {
    const express = require('express');
    const router = express.Router();
    const multer = require('multer');
    const path = require('path');

    // Set up storage for multer
    const storage = multer.diskStorage({
        destination: './public/uploads/',
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
    }).single('profilePicture');

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

    router.post('/update', (req, res) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            const userId = bearerToken.split('-')[1]; // Assumes token is "token-USER_ID"

            upload(req, res, (err) => {
                if(err){
                    res.status(400).json({ msg: err });
                } else {
                    const user = clients.find(c => c.id == userId);

                    if (!user) {
                        return res.status(404).json({ msg: 'User not found' });
                    }

                    user.username = req.body.username || user.username;
                    user.name = req.body.name || user.name;
                    user.email = req.body.email || user.email;
                    user.number = req.body.number || user.number;
                    if(req.file){
                        user.profilePicture = `/uploads/${req.file.filename}`;
                    }

                    res.json({
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        number: user.number,
                        profilePicture: user.profilePicture
                    });
                }
            });
        } else {
            res.sendStatus(403);
        }
    });

    return router;
};
