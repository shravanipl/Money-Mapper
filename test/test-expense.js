const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');

const {
    HTTP_STATUS_CODES,
    JWT_SECRET,
    JWT_EXPIRY
} = require('../config');
const {
    startServer,
    stopServer,
    app
} = require('../server.js');
const {
    User
} = require('../users/models');
const {
    Expense
} = require('../expenses/models');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for: /api/expenses', function () {
    let testUser, jwtToken;

    before(function () {
        return startServer(true);
    });

    beforeEach(function () {
        testUser = createFakerUser();

        return User.hashPassword(testUser.password)
            .then(hashedPassword => {
                return User.create({
                    name: testUser.name,
                    email: testUser.email,
                    username: testUser.username,
                    password: hashedPassword,
                }).catch(err => {
                    throw new Error(err);
                });
            })
            .then(createdUser => {
                testUser.id = createdUser.id;
                jwtToken = jsonwebtoken.sign({
                        user: {
                            id: testUser.id,
                            name: testUser.name,
                            email: testUser.email,
                            username: testUser.username,
                        },
                    },
                    JWT_SECRET, {
                        algorithm: 'HS256',
                        expiresIn: JWT_EXPIRY,
                        subject: testUser.username,
                    }
                );

                const seedData = [];
                for (let i = 1; i <= 10; i++) {
                    const newExpense = createFakerExpense();
                    newExpense.user = createdUser.id;
                    seedData.push(newExpense);
                }
                return Expense.insertMany(seedData).catch(err => {
                    console.error(err);
                    throw new Error(err);
                });
            });
    });

    afterEach(function () {
        return new Promise((resolve, reject) => {
            // Deletes the entire database.
            mongoose.connection
                .dropDatabase()
                .then(result => {
                    console.log(`The result is ${result}`);
                    resolve();
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    });

    after(function () {
        stopServer();
    });

    it('Should create a new expense', function () {
        const newExpenseData = createFakerExpense();

        return chai.request(app)
            .post('/api/expenses')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(newExpenseData)
            .then(res => {
                  expect(res).to.have.status(HTTP_STATUS_CODES.CREATED);
                  expect(res).to.be.json;
            })
    });

    it('Should return user expenses', function () {
        return chai
            .request(app)
            .get('/api/expenses')
            .set('Authorization', `Bearer ${jwtToken}`)
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.OK);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
                const expense = res.body[0];
                expect(expense).to.include.keys('date', 'expenseInfo', 'category', 'amount');
                expect(expense.user).to.be.a('object');
                expect(expense.user).to.include.keys('name', 'email', 'username');
            });
    });

    it('Should update a specific expense', function () {
        let expenseToUpdate;
        const newExpenseData = createFakerExpense();
        return Expense.find()
            .then(expenses => {
                expect(expenses).to.have.lengthOf.at.least(1);
                expenseToUpdate = expenses[0];

                return chai
                    .request(app)
                    .put(`/api/expenses/${expenseToUpdate.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .send(newExpenseData);
            })
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);

                return Expense.findById(expenseToUpdate.id);
            })
            .then(expense => {
                expect(expense).to.be.a('object');
            });
    });

    it('Should delete a specific expense', function () {
        let expenseToDelete;
        return Expense.find()
            .then(expenses => {
                expect(expenses).to.be.a('array');
                expect(expenses).to.have.lengthOf.at.least(1);
                expenseToDelete = expenses[0];

                return chai
                    .request(app)
                    .delete(`/api/expenses/${expenseToDelete.id}`)
                    .set('Authorization', `Bearer ${jwtToken}`);
            })
            .then(res => {
                expect(res).to.have.status(HTTP_STATUS_CODES.NO_CONTENT);

                return Expense.findById(expenseToDelete.id);
            })
            .then(expense => {
                expect(expense).to.not.exist;
            });
    });

    function createFakerUser() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            username: `${faker.lorem.word()}${faker.random.number(100)}`,
            password: faker.internet.password(),
            email: faker.internet.email(),
        };
    }

    function createFakerExpense() {
        return {
            date: faker.date.past(),
            expenseInfo: faker.lorem.text(),
            category: 'fuel',
            amount: faker.finance.amount(),
        };
    }
});