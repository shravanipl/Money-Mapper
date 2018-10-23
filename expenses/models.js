'use strict';
const mongoose = require('mongoose');
const Joi = require('joi');

mongoose.Promise = global.Promise;

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: String
    },
    expenseInfo: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

ExpenseSchema.methods.serialize = function () {
    let user;
    // We serialize the user if it's populated to avoid returning any sensitive information, like the password hash.
    if (typeof this.user.serialize === 'function') {
        user = this.user.serialize();
    } else {
        user = this.user;
    }
    return {
        user: user,
        id: this._id || '',
        date: this.date || '',
        expenseInfo: this.expenseInfo || '',
        category: this.category || '',
        amount: this.amount || ''
    };
};

ExpenseSchema.methods.graphFields = function () {
    return {
        category: this.category || '',
        amount: this.amount || ''
    };
};

const ExpenseJoiSchema = Joi.object().keys({
    user: Joi.string().optional(),
    date: Joi.string().min(1).required(),
    expenseInfo: Joi.string().min(1).required(),
    category: Joi.string().min(1).required(),
    amount: Joi.number().min(1).required()
});

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = {
    Expense,
    ExpenseJoiSchema
};