const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const joi = require('joi');

const {PORT,HTTP_STATUS_CODES,MONGO_URL,TEST_MONGO_URL} = require('./config');
const {authRouter} = require('./auth/router');
const {userRouter} = require('./users/router');
const {expenseRouter} = require('./expenses/router');
const {localStrategy,jwtStrategy} = require('./auth/strategies');

//Creates express app
const app = express();
let server;
//Configure Passport to use our localStrategy when receiving Username + Password combinations
passport.use(localStrategy)
// Configure Passport to use our jwtStrategy when receving JSON Web Tokens
passport.use(jwtStrategy);

//Middleware
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('./public')); 

//Router
app.use('/api/auth', authRouter);
app.use('/api/users',userRouter);
app.use('/api/expenses', expenseRouter);

app.get('/isAuthenticated', (req, res, next) => {
    res.send(200).json(req.body);
});

app.use('*', (req,res) =>{
   res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
error : "Not Found"      
   });
});


function startServer(testEnv){
     return new Promise((resolve,reject) =>{
         let mongourl;
         if(testEnv){
             mongourl = TEST_MONGO_URL;
         }
         else
         mongourl = MONGO_URL;
        //Step 1 Connect to MongoDB with mongoose 
         mongoose.connect(mongourl, {useNewUrlParser : true}, err=>{
             //Step 2A If there is an error starting mongo reject promise and stop code execution
            if(err){
            console.error(err);
            reject(err);
            }
            else{
                //Step 2B Start Express server
            server = app.listen(PORT, ()=>{
                //Step 3A Log Success message to console and resolve Promise
                console.log(`Express server listening on ${PORT}`);
                resolve();
            }).on('error', err=>{
                //Step 3B If error on starting Express then disconnect Mongo and log error
                mongoose.disconnect();
                console.error(err);
                reject(err);
            });
            };
         })
     })
}

function stopServer(){

    //Step 1 Disconnect from Mongo DB
    return mongoose
    .disconnect()
    .then(()=>{
         return new Promise((resolve,reject)=>{
             //Step 2 Shut down the server
             server.close(err=>{
                 if(err){
                     //Step 3A If error console the error and reject the promise
                     console.log(err);
                     return reject(err);
                 } else{
                     //Step 3B If server shut down successfully log the success
                     console.log('Server was stopped successfully');
                 }
             });
         }
    );
   });
}

module.exports ={app,startServer,stopServer};



