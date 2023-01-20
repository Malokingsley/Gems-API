/////////////////////////////////////
//// Import Dependencies         ////
/////////////////////////////////////
const express = require('express')
const Gem = require('../models/gems')

/////////////////////////////////////
//// Create Router               ////
/////////////////////////////////////
const router = express.Router()

//////////////////////////////
//// Routes               ////
//////////////////////////////

// INDEX route 
// Read -> finds and displays all gems
router.get('/', (req, res) => {
    // find all the gems
    Gem.find({})
        // there's a built in function that runs before the rest of the promise chain
        // this function is called populate, and it's able to retrieve info from other documents in other collections
        .populate('owner', 'username')
        .populate('comments.author', '-password')
        // send json if successful
        .then(gems => { 
            // res.json({ gems: gems })
            // now that we have liquid installed, we're going to use render as a response for our controllers
            res.render('gems/index', { gems })
        })
        // catch errors if they occur
        .catch(err => {
            console.log(err)
            res.status(404).json(err)
        })
})

// CREATE route
// Create -> receives a request body, and creates a new document in the database
router.post('/', (req, res) => {
    // console.log('this is req.body before owner: \n', req.body)
    // here, we'll have something called a request body
    // inside this function, that will be called req.body
    // we want to pass our req.body to the create method
    // we want to add an owner field to our gem
    // luckily for us, we saved the user's id on the session object, so it's really easy for us to access that data
    req.body.owner = req.session.userId
    const newFruit = req.body
    // console.log('this is req.body aka newFruit, after owner', newFruit)
    Gem.create(newFruit)
        // send a 201 status, along with the json response of the new gem
        .then(gem => {
            res.status(201).json({ gem: gem.toObject() })
        })
        // send an error if one occurs
        .catch(err => {
            console.log(err)
            res.status(404).json(err)
        })
})

// GET route
// Index -> This is a user specific index route
// this will only show the logged in user's gems
router.get('/mine', (req, res) => {
    // find gems by ownership, using the req.session info
    Gem.find({ owner: req.session.userId })
        .populate('owner', 'username')
        .populate('comments.author', '-password')
        .then(gems => {
            // if found, display the gems
            res.status(200).json({ gems: gems })
        })
        .catch(err => {
            // otherwise throw an error
            console.log(err)
            res.status(400).json(err)
        })
})

// PUT route
// Update -> updates a specific gem(only if the gem's owner is updating)
router.put('/:id', (req, res) => {
    const id = req.params.id
    Gem.findById(id)
        .then(gem => {
            // if the owner of the gem is the person who is logged in
            if (gem.owner == req.session.userId) {
                // send success message
                res.sendStatus(204)
                // update and save the gem
                return gem.updateOne(req.body)
            } else {
                // otherwise send a 401 unauthorized status
                res.sendStatus(401)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
})

// DELETE route
// Delete -> delete a specific gem
router.delete('/:id', (req, res) => {
    const id = req.params.id
    Gem.findById(id)
        .then(gem => {
            // if the owner of the gem is the person who is logged in
            if (gem.owner == req.session.userId) {
                // send success message
                res.sendStatus(204)
                // delete the gem
                return gem.deleteOne()
            } else {
                // otherwise send a 401 unauthorized status
                res.sendStatus(401)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
})

// SHOW route
// Read -> finds and displays a single resource
router.get('/:id', (req, res) => {
    // get the id -> save to a variable
    const id = req.params.id
    // use a mongoose method to find using that id
    Gem.findById(id)
        .populate('comments.author', 'username')
        // send the gem as json upon success
        .then(gem => {
            res.json({ gem: gem })
        })
        // catch any errors
        .catch(err => {
            console.log(err)
            res.status(404).json(err)
        })
})


//////////////////////////////
//// Export Router        ////
//////////////////////////////
module.exports = router

