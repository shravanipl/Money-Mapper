const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const {
    PORT,
    HTTP_STATUS_CODES,
    MONGO_URL,
    TEST_MONGO_URL
} = require('./config');
const {
    authRouter
} = require('./auth/router');
const {
    userRouter
} = require('./users/router');
const {
    expenseRouter
} = require('./expenses/router');
const {
    localStrategy,
    jwtStrategy
} = require('./auth/strategies');

const app = express();
let server;
passport.use(localStrategy);
passport.use(jwtStrategy);

//Middleware
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('./public'));

//Router
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/expenses', expenseRouter);

app.get('/isAuthenticated', (req, res, next) => {
    res.send(200).json(req.body);
});

app.use('*', (req, res) => {
    res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        error: 'Not Found',
    });
});

function startServer(testEnv) {
    return new Promise((resolve, reject) => {
        let mongourl;
        if (testEnv) {
            mongourl = TEST_MONGO_URL;
        } else mongourl = MONGO_URL;
        mongoose.connect(
            mongourl, {
                useNewUrlParser: true,
            },
            err => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    server = app
                        .listen(PORT, () => {
                            console.log(`Express server listening on ${PORT}`);
                            resolve();
                        })
                        .on('error', err => {
                            mongoose.disconnect();
                            console.error(err);
                            reject(err);
                        });
                }
            }
        );
    });
}

function stopServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            server.close(err => {
                if (err) {
                    console.log(err);
                    return reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

module.exports = {
    app,
    startServer,
    stopServer,
};
