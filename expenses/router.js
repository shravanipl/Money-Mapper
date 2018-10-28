const express = require('express');
const Joi = require('joi');
const date = require('dateformat');
const expenseRouter = express.Router();
const mongoose = require('mongoose');

const {
    HTTP_STATUS_CODES
} = require('../config.js');
const {
    jwtPassportMiddleware
} = require('../auth/strategies.js');
const {
    Expense,
    ExpenseJoiSchema
} = require('./models.js');

//expenseRouter.use(jwtStrategy);

expenseRouter.get('/', jwtPassportMiddleware, (request, response) => {
    Expense.find({
            user: request.user.id
        })
        .populate('user')
        .then(expenses => {
            console.log(expenses);
            return response.status(HTTP_STATUS_CODES.OK).json(expenses.map(expense => expense.serialize()));
        })
});

expenseRouter.post('/monthly', jwtPassportMiddleware, (request, response) => {
    let date = `${request.body.month.substr(0, 3)}-${request.body.year}`;
    Expense.find({
            user: request.user.id,
            date: {
                $regex: date
            },
        })
        .populate('user')
        .then(expenses => {
            return response.status(HTTP_STATUS_CODES.OK).json(expenses.map(expenses => expenses.graphFields()));
        });
});

expenseRouter.post('/daily', jwtPassportMiddleware, (request, response) => {
    Expense.find({
            user: request.user.id,
            date: request.body.date
        })
        .populate('user')
        .then(expenses => {
            return response.status(HTTP_STATUS_CODES.OK).json(expenses.map(expenses => expenses.graphFields()));
        });
});

expenseRouter.get('/totalExpenses', jwtPassportMiddleware, (request, response) => {
    Expense.find({
            user: request.user.id
        })
        .populate('user')
        .then(expenses => {
            return response.status(HTTP_STATUS_CODES.OK).json(expenses.map(expenses => expenses.graphFields()));
        })
});

expenseRouter.get('/groupExpense', jwtPassportMiddleware, (request, response) => {
    console.log(request.user.id);
    Expense.aggregate([{
                "$match": {
                    "user": mongoose.Types.ObjectId(request.user.id)
                }
            },
            {
                "$group": {
                    "_id": {
                        "$arrayElemAt": [{
                            "$split": ["$date", "-"]
                        }, 1]
                    },
                    "Total": {
                        "$sum": "$amount"
                    }
                }
            }
        ])
        .then(expenses => {
            console.log("expenses", expenses);
            return response.status(HTTP_STATUS_CODES.OK).json(expenses);
        })
        .catch(error => {
            console.error(error);
            return response.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);

        });
});

expenseRouter.post('/', jwtPassportMiddleware, (request, response) => {
    const expense = {
        user: request.user.id,
        date: request.body.date,
        expenseInfo: request.body.expenseInfo,
        category: request.body.category,
        amount: request.body.amount
    };

    const validation = Joi.validate(expense, ExpenseJoiSchema);
    if (validation.error) {
        return response.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            error: validation.error
        });
    }

     Expense.create(expense)
         .then(expense => {
             console.log("get latest expense records");

              Expense.find({
                      user: request.user.id
                  })
                  .populate('user')
                  .then(expenses => {
                      const latestExpenses = expenses.map(expense => expense.serialize());
                      console.log(latestExpenses);
                      return response.status(HTTP_STATUS_CODES.CREATED).json(latestExpenses);
                  })
                  .catch(error => {
                      return response.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
                  });
         });
});


expenseRouter.put('/:expenseid', jwtPassportMiddleware, (request, response) => {
    console.log("put", request.body);
    const updatedExpense = {
        date: request.body.date,
        expenseInfo: request.body.expenseInfo,
        category: request.body.category,
        amount: request.body.amount
    }
    const validation = Joi.validate(updatedExpense, ExpenseJoiSchema);
    if (validation.error) {
        return response.status(HTTP_STATUS_CODES.BAD_REQUEST).json(validation.error);
    }
    Expense.findByIdAndUpdate(request.params.expenseid, {
            $set: updatedExpense
        })
        .then(() => {
            return response.status(HTTP_STATUS_CODES.NO_CONTENT).end();
        })
        .catch(error => {
            return response.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});

expenseRouter.delete('/:expenseid', jwtPassportMiddleware, (request, response) => {
    Expense.findByIdAndRemove(request.params.expenseid)
        .then(() => {
            return response.status(HTTP_STATUS_CODES.NO_CONTENT).end();
        })
        .catch(error => {
            return response.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(error);
        });
});


module.exports = {
    expenseRouter
};