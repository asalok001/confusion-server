const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const FavouriteSchema = require('../models/favourites');
const { json } = require('express');
// const { populate } = require('../models/favourites');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
    .get(authenticate.verifyuser, (req, res, next) => {
        FavouriteSchema.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .exec((err, favourites) => {
                if (err) return next(err);
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            });
    })
    .post(authenticate.verifyuser, (req, res, next) => {

        FavouriteSchema.findOne({ user: req.user._id }, (err, favourite) => {
            if (err) return next(err);
            if (!favourite) {
                FavouriteSchema.create({ user: req.user._id })
                    .then((favourite) => {
                        for (i = 0; i < req.body.length; i++)
                            if (favourite.dishes.indexOf(req.body[i]._id) <= 0)
                                favourite.dishes.push(req.body[i]);
                        favourite.save()
                            .then((favourite) => {
                                // FavouriteSchema.findOne({ user: req.user._id })
                                FavouriteSchema.findById(favourite._id)
                                    .populate('user')
                                    .populate('dish')
                                    .then((favourites) => {
                                        console.log('Favourite created in if', favourites);
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favourites);
                                    }, (err) => next(err))
                                    .catch((err) => next(err))
                            }, (err) => next(err))
                            .catch((err) => next(err));

                    })
            }
            else {
                for (i = 0; i < req.body.length; i++)
                    if (favourite.dishes.indexOf(req.body[i]._id) > 0)
                        favourite.dishes.push(req.body[i]);
                favourite.save()
                    .then((favourite) => {
                        console.log('Favourite created in else', favourite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
                FavouriteSchema.findOne({ user: req.query._id })
                    .populate('user')
                    .populate('dishes')
                    .then((err, favourites) => {
                        if (err) return next(err);
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
        })
    });



favouriteRouter.route('/:dishId')
    .get(authenticate.verifyuser, (req, res, next) => {
        FavouriteSchema.findOne({ user: req.user._id })
            .then((favorites) => {

                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                } else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyuser, (req, res, next) => {
        // var dish1 = req.params._dishId;
        FavouriteSchema.findOne({ user: req.body._id }, (err, favourite) => {
            if (err) {
                return next(err)
            }
            if (!favourite) {
                FavouriteSchema.create({ user: req.user._id })
                    .then((fav) => {
                        fav.dishes.push({ '_id': req.params.dishId })
                        fav.save()
                            .then((favourite) => {
                                FavouriteSchema.findById(favourite._id)
                                    .populate('user')
                                    .populate('dish')
                                    .then((favourite) => {
                                        console.log("fav is created", favourite);
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favourite)
                                    }, (err) => next(err))
                                    .catch((err) => next(err));
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    })
                    .catch((err) => next(err));
            }
        });
    })
    .put(authenticate.verifyuser, (req, res, next) => {
        res.statusCode = 403;
        res.end('Put operation cannot be done on dishes ');
    })
    .delete(authenticate.verifyuser, (req, res, next) => {
        FavouriteSchema.findOne({ user: req.user._id }, (err, favourite) => {
            if (err) return next(err);

            var index = favourite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favourite.dishes.splice(index, 1);
                favourite.save()
                    .then((favourite) => {
                        console.log("Deleted", favourite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
            else {
                err = new Error('Not Existed');
                err.status = 401;
                return next(err);
            }
        });
    });


module.exports = favouriteRouter;
