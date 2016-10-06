'use strict';

const FormData = require('form-data');
const Promise = require('bluebird');
const debug = require('debug')('catgram:form-request');

//require in form requests
//this function will include the URL we're trying to make a request to and the data we want to send
//will return a Promise and parse JSON
module.exports = function(url, params){
  debug();
  return new Promise((resolve, reject) => {
    let form = new FormData();
    // let options = {
    //   header: `Authorization: Bearer ${token}`,
    // };
    for(var key in params){
      form.append(key, params[key]);
    }
    form.submit(url, function(err, res){
      if (err) return reject(err);
      let json = '';
      res.on('data', data => json += data.toString()); //every time we get chunks of data, accumulate as string and parse as json
      res.on('end', () => {
        try{
          res.body = JSON.parse(json);
          resolve(res);
        } catch(err){
          reject(err);
        }
      });
    });
  });
};
