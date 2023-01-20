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
// Subdocuments are not mongoose models. That means they don't have their own collection, and they don't come with the same model methods that we're used to(they have some their own built in.)
// This also means, that a subdoc is never going to be viewed without it's parent document. We'll never see a comment without seeing the gem it was commented on first.

// This also means, that when we make a subdocument, we must MUST refer to the parent so that mongoose knows where in mongodb to store this subdocument

// POST -> `/comments/<someFruitId>`
// only loggedin users can post comments
// bc we have to refer to a gem, we'll do that in the simplest way via the route
router.post('/:gemID', (req, res) => {
    // first we get the gemID and save to a variable
    const gemID = req.params.gemID
    // then we'll protect this route against non-logged in users
    console.log('this is the session\n', req.session)
    if (req.session.loggedIn) {
        // if logged in, make the logged in user the author of the comment
        // this is exactly like how we added the owner to our fruits
        req.body.author = req.session.userId
        // saves the req.body to a variable for easy reference later
        const theComment = req.body
        // find a specific gem
        Gem.findById(gemID)
            .then(gem => {
                // create the comment(with a req.body)
                gem.comments.push(theComment)
                // save the gem
                return gem.save()
            })
            // respond with a 201 and the gem itself
            .then(gem => {
                res.status(201).json({ gem: gem })
            })
            // catch and handle any errors
            .catch(err => {
                console.log(err)
                res.status(400).json(err)
            })
    } else {
        res.sendStatus(401) //send a 401-unauthorized
    }
})

// DELETE -> `/comments/delete/<someFruitId>/<someCommentId>`
// make sure only the author of the comment can delete the comment
router.delete('/delete/:gemID/:commId', (req, res) => {
    // isolate the ids and save to variables so we don't have to keep typing req.params
    // const gemID = req.params.gemID
    // const commId = req.params.commId
    const { gemID, commId } = req.params
    // get the gem
    Gem.findById(gemID)
        .then(gem => {
            // get the comment, we'll use the built in subdoc method called .id()
            const theComment = gem.comments.id(commId)
            console.log('this is the comment to be deleted: \n', theComment)
            // then we want to make sure the user is loggedIn, and that they are the author of the comment
            if (req.session.loggedIn) {
                // if they are the author, allow them to delete
                if (theComment.author == req.session.userId) {
                    // we can use another built in method - remove()
                    theComment.remove()
                    gem.save()
                    res.sendStatus(204) //send 204 no content
                } else {
                    // otherwise send a 401 - unauthorized status
                    res.sendStatus(401)
                }
            } else {
                // otherwise send a 401 - unauthorized status
                res.sendStatus(401)
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
})


//////////////////////////////
//// Export Router        ////
//////////////////////////////
module.exports = router