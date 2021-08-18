const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const uploadRouter = express.Router();

const storage = multer.diskStorage({

    destination: (req, file, callback) =>{
        callback(null, 'public/images');
    },

    filename: (req, file, callback) =>{
        callback(null, file.originalname);
    }
});

const imageFilter = (req, file, callback) =>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return callback(new Error('You can upload image file only'), false);
    }
    else{
        callback(null, true);
    }
};

const upload = multer({storage: storage, fileFilter: imageFilter});

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyuser, authenticate.verifyadmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('Get operation is no supported on /imageupload');
})
.post(authenticate.verifyuser, authenticate.verifyadmin, 
    upload.single('imageFile'),(req, res, next) =>{

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
})
.put(authenticate.verifyuser, authenticate.verifyadmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('Put operaation is not supported on / imageUpload');
})
.delete(authenticate.verifyuser, authenticate.verifyadmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end('Delete operation is not supported on /imageUpload')
})

module.exports = uploadRouter;