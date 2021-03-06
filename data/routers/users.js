// import express, define router, and define db
const express = require('express');
const router = express.Router();
const db = require('../helpers/userDb');

// import middleware
const nameMiddleware = require('../middleware/nameToUppercase');
const numberIdCheck = require('../middleware/numberIdCheck');

// Create/post logic
router.post('/', (req, res) => {
    if (typeof req.body.name === 'string' && req.body.name.length < 128) { // check for string name, less than 128 chars.
        const user = nameMiddleware(req.body);
        db
            .insert(user) // insert user with name uppercase
            .then(newuser => {
                res
                    .status(201)
                    .json(newuser)
            });
        } else if (typeof req.body.name !== 'string') { // error 400 if not string
            res
                .status(400)
                .json({ err: 'user name is invalid, must be a string of length < 128!'});
        } else {
            res
                .status(500)
                .json({ err: 'user cannot be added to db!'});
        }
})

// Read/get logic
router.get('/', (req, res) => {
    db
        .get() // retrieve all users
        .then( users => {
            console.log(users) // users is an array of objects!
            res.json(users);
        })
        .catch(err => {
            res
                .status(500)
                .json({ error: 'Failed to retrieve users'})
    });
});

router.get('/:id', (req, res) => { // retrieve user by id
    const id = req.params.id; // set variable for id of get request object
    if (numberIdCheck(id)) {
        db
            .get(id)
            .then(user => {
                if (user) {
                    console.log(user); // returns looked up user object
                    res
                        .status(200)
                        .json(user);
                    } else if (!user) {
                        res
                            .status(404)
                            .json({ err: 'User ID not found in DB (ID cannot be located)'})
                            .catch(err => { res.status(500).json({err: 'Server failed to retrieve user...'}) });ks
                    }
                }
            );
    } else {
        res
        .status(500)
        .json({ err: 'Cannot retrieve user..'});
    }
})

router.get('/:id/posts', (req, res) => {
    const { id } = req.params;
    if (numberIdCheck(id)) {
        db
            .getUserPosts(id)
            .then(posts => {
                console.log(posts)
                if (posts) {
                    res
                        .status(200)
                        .json(posts);
                } else if (!posts) {
                    res
                        .status(404)
                        .json({err: `Posts by user ${id} not found. User does not exist`})
                        .catch(err => { res.status(500).json({err: 'Server failed to get posts from user...'})});
                }
            })
            .catch(err => { res.status(500).json({err: 'Server failed to get posts from user...'})});
    } else {
        res.status(500).json({err: 'Server failed to get posts from user...'});
    }
})

// Update/put logic
router.put('/:id', (req, res) => {
    const changes = req.body; // specify object used to update existing user
    const id = req.params.id; // specify id
    if (numberIdCheck(id)) { // use middleware to check for loose equality of id to integer
        db
            .update(id, changes)
            .then(count => {
                if (count) {
                    res
                        .status(200)
                        .json(count) // return number of records changed (1)
                } else if (!count) {
                    res
                        .status(404)
                        .json({err: 'User not found'})
                        .catch(err => { res.status(500).json({err: 'Server unable to update user...'})})
                }
                /*
                    To return new user object instead of a count add
                    if(count) {
                        db
                            .get(id)
                            .then(updatedUser => {
                                res
                                    .status(200)
                                    .json(updatedUser);
                            })
                }
                */
            })
            .catch(err => res.status(500).json({err: 'Server failed to update user...ks'}))
    } else { res.status(500).json({ message: 'error updating user'})}
})

// Delete/remove logic
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    if (numberIdCheck(id)) { 
        db
            .remove(id)
            .then(count => {
                if (count) {
                    res
                        .status(200)
                        .json(count);
                } else if (!count) {
                    res
                        .status(404)
                        .json({ message: 'id is not valid (user not found)'});
                }
            })
            .catch(err => {
                res
                    .status(500)
                    .json({ message: 'failed to remove'});
            })
        } else { res.status(500).json({ message: 'Error removing user'}) }
})
module.exports = router; // Export the route
