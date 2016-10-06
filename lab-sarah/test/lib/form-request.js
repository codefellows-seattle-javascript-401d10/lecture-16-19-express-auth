'use strict';

//this is our new superagent for forms
//only used for testing, is a helper file for testing
//don't want to have to test things by sending to aws because it costs money. Instead test it before you send to aws

const FormData = require('form-data');
const Promise = require('bluebird');
const debug = require('debug')('sarahgram:form-request');

//url is where were trying to make request to, and the data that we're going to send to that url
//params will be the exampledata
module.exports = function(url, token, params){
  debug();
  return new Promise((resolve, reject) => {
    let form = new FormData();
    for (var key in params){
      //every time you append something, you give it the options which you need for auth
      form.append(key, params[key]);
    }
      //construct a form using the object that was passed into this function
    form.submit(url,function(err, res){
      if (err)
        return reject(err);
      let json = '';
      //every time we get some data, we're going to accumulate it in a string and try to parse it
      res.on('data', data => json += data.toString());
      res.on('end', () => {
        try {
          res.body = JSON.parse(json);
          resolve(res);
          // the error is that it wasn't json
        } catch(err) {
          reject(err);
        }
      });
    });
  });
};
