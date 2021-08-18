const express = require('express'); 
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Leaders = require('../models/leaders');
const cors  = require('./cors');

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200); })
.get(cors.cors, (req , res, next) =>{
    Leaders.find(req.query)
    .then((leaders) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyuser, authenticate.verifyadmin, (req , res, next) =>{
    Leaders.create(req.body)
    .then((leaders) =>{
        console.log('Leaders Created', leaders);
        res.statusCode= 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, (err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyuser, authenticate.verifyadmin, (req,res, next) =>{
    res.statusCode = 403;
    res.end('Put operation cannot be done on Leaders');
})
.delete(cors.corsWithOptions, authenticate.verifyuser, authenticate.verifyadmin, (req, res, next) =>{
    Leaders.remove({})
    .then((response) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, (err) => next(err))
    .catch((err) => next(err));
});

 leaderRouter.route('/:leaderId')
 .options(cors.corsWithOptions, (req,res) =>{res.sendStatus(200); })
 .get(cors.cors,(req, res, next) =>{
     Leaders.findById(req.params.leaderId)
     .then((leader) =>{
         res.statusCode= 200;
         res.setHeader('Content-Type', 'application/json');
         res.json(leader);
     }, (err) => next(err))
     .catch((err) => next(err));
 
 })
 .post(cors.corsWithOptions, authenticate.verifyuser, authenticate.verifyadmin, (req, res, next) =>{
     res.statusCode = 403;
     res.end('Post Operation cannot be done on ' +req.params.leaderId);
 })
 .put(cors.corsWithOptions, authenticate.verifyuser, authenticate.verifyadmin, (req,res, next) =>{
     Leaders.findByIdAndUpdate(req.params.leaderId, {
         $set: req.body
     }, {new : true})
     .then((leader) =>{
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         res.json(leader);
     }, (err) => next(err))
     .catch((err) => next(err));
 })
.delete(cors.corsWithOptions, authenticate.verifyuser, authenticate.verifyadmin, (req, res, next) =>{
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((response) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'applicaion/json');
        res.json(response);
    }, (err) => next(err))
    .catch((err) => next(err));
})
module.exports = leaderRouter;