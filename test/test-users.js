'use strict';

const chai= require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const app = require('../server');


describe('Test the root URL', function(){
    it('Should pass when the root URL is entered', function(){
          return chai
          .request(app)
          .get('/')
          .then(res=>{
              expect(res).to.have.status(200);
          });
    });
});