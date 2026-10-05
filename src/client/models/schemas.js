const mongoose = require('mongoose')

//forum schema
const forumSchema = new mongoose.Schema({
        forumName:{
        type: String,
        required: true,
        unique: true
    }
})

//user schema
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    forums: {
        type: [forumSchema],
        default: []
    }
})

module.exports = mongoose.model('User', userSchema)