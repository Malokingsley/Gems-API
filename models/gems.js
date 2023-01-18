//////////////////////////////////////////////////////////////
//// Our schema and model for the fruit resource          ////
//////////////////////////////////////////////////////////////
const mongoose = require('mongoose') // import mongoose

// we'll destructure the Schema and model functions from mongoose
const { Schema, model } = mongoose

// fruits schema
const gemsSchema = new Schema({
    name: String,
    color: String,
    easyToFind: Boolean
})

// make the fruit model
// the model method takes two arguments
// the first is what we call our model
// the second is the schema used to build the model
const Gem = model('Gem', gemsSchema)

//////////////////////////
//// Export our Model ////
//////////////////////////
module.exports = Gem