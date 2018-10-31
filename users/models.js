const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength:20
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true],
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    username: {
        type: String,
        required: true,
        unique: [true],
        minlength: 4,
        maxlength:15
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength:72
    },
});


userSchema.methods.serialize = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        username: this.username,
    };
};


 userSchema.statics.hashPassword =  function (password) {
     return bcrypt.hash(password, 10);
 };



userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('user', userSchema);

module.exports = {
    User
};