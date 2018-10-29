'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const {
    app,
    startServer,
    stopServer
} = require('../server');

const {
    User
} = require('../users/models');
const {
    TEST_DATABASE_URL
} = require('../config');


// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('/api/users', function () {
    const username = 'exampleUser';
    const password = 'examplePass';
    const name = 'example';
    const email = 'example@gmail.com';
    const usernameB = 'exampleUserB';
    const passwordB = 'examplePassB';
    const nameB = 'exampleB';
    const emailB = 'exampleB@gmail.com';

    before(function () {
        return startServer(TEST_DATABASE_URL);
    });

    after(function () {
        return stopServer();
    });

    beforeEach(function () {});

    afterEach(function () {
        return User.remove({});
    });

    describe('/api/users', function () {
        describe('POST', function () {
            it('Should reject users with missing username', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        password,
                        name,
                        email,

                    })
                    .then(() =>
                        expect.fail(null, null, 'Request should not succeed')
                    )
                    .catch(err => {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }

                        const res = err.response;
                        expect(res).to.have.status(400);
                        expect(res.body.error.details[0].message).to.equal(
                            '"username" is required');
                    });
            });
            it('Should reject users with missing password', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        name,
                        email
                    })
                    .then(() =>
                        expect.fail(null, null, 'Request should not succeed')
                    )
                    .catch(err => {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }

                        const res = err.response;
                        expect(res).to.have.status(400);
                        expect(res.body.error.details[0].message).to.equal(
                            '"password" is required');
                    });
            });
            it('Should reject users with empty username', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username: '',
                        password,
                        name,
                        email
                    })
                    .then(() =>
                        expect.fail(null, null, 'Request should not succeed')
                    )
                    .catch(err => {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }

                        const res = err.response;
                        expect(res).to.have.status(400);
                    });
            });
            it('Should reject users with password less than 5 characters', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password: '123',
                        name,
                        email
                    })
                    .then(() =>
                        expect.fail(null, null, 'Request should not succeed')
                    )
                    .catch(err => {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }

                        const res = err.response;
                        expect(res).to.have.status(400);
                        expect(res.body.error.details[0].message).to.equal(
                            '"password" length must be at least 5 characters long');
                    });
            });
            it('Should reject users with duplicate username', function () {
                // Create an initial user
                return User.create({
                        username,
                        password,
                        name,
                        email
                    })
                    .then(() =>
                        // Try to create a second user with the same username
                        chai.request(app).post('/api/users').send({
                            username,
                            password,
                            name,
                            email
                        })
                    )
                    .then(() =>
                        expect.fail(null, null, 'Request should not succeed')
                    )
                    .catch(err => {
                        const res = err.response;
                        expect(res).to.have.status(400);
                        expect(res.body.error).to.equal(
                            'Database Error: A user with that username and/or email already exists.'
                        );
                    });
            });
            it('Should create a new user', function () {
                return chai
                    .request(app)
                    .post('/api/users')
                    .send({
                        username,
                        password,
                        name,
                        email
                    })
                    .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.keys(
                            'id',
                            'username',
                            'name',
                            'email'
                        );
                        expect(res.body.username).to.equal(username);
                        expect(res.body.name).to.equal(name);
                        expect(res.body.email).to.equal(email);
                        return User.findOne({
                            username
                        });
                    })
                    .then(user => {
                        expect(user).to.not.be.null;
                        expect(user.name).to.equal(name);
                        expect(user.email).to.equal(email);
                        return user.validatePassword(password);
                    })
                    .then(passwordIsCorrect => {
                        expect(passwordIsCorrect).to.be.true;
                    });
            });
        });

        describe('GET', function () {
            it('Should return an empty array initially', function () {
                return chai.request(app).get('/api/users').then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.length(0);
                });
            });
            it('Should return an array of users', function () {
                return User.create({
                        username,
                        password,
                        name,
                        email
                    }, {
                        username: usernameB,
                        password: passwordB,
                        name: nameB,
                        email: emailB
                    })
                    .then(() => chai.request(app).get('/api/users'))
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.an('array');
                        expect(res.body).to.have.length(2);

                        expect(res.body[0]).to.have.keys(
                            'id',
                            'username',
                            'name',
                            'email'
                        );

                        expect(res.body[1]).to.have.keys(
                            'id',
                            'username',
                            'name',
                            'email'
                        );
                    });
            });
        });
    });
});