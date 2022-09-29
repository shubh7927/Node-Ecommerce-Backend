const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"Please Enter Your Full Name"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate: [validator.isEmail, "Please Enter a valid email."]
    },
    password:{
        type:String,
        required:[true,"Please Enter Password"],
        validate:[validator.isStrongPassword,"Enter a strong password"]
    },
    profilePic: {
        public_id: {
            type: String,
            // required: true
        },
        url: {
            type: String,
            // required: true
        }
    },
    address:String,
    access:{
        type:String,
        default:"user"
    },
    resetPasswordCode:String,
    resetPasswordExpiry: Date
})

module.exports = mongoose.model("User",userSchema);
