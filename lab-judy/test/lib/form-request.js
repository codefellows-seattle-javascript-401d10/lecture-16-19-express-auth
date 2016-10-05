'use strict';

const FormData = require('form-data');
const Promise = require('bluebird');
const debug = require('debug')('judy: form-request');

module.exports = function(url, token, params){
  debug();
  console.log('url', url);
  return new Promise((resolve, reject) => {
    let form = new FormData();



    for (var key in params){
      form.append(key, params[key]);
    }

    form.submit(url, function(err, res){
      if (err) return reject(err);

      let json = '';
      res.on('data', data => {
        json += data.toString();
        console.log(json, 'json lines 26 of form-request.js');
        return json;
      });
      res.on('end', () => {
        try {
          res.body = JSON.parse(json);
          console.log(res.body, ' line 33');
          resolve(res);
        } catch(err) {
          reject(err); //if error, means JSON not being returned
        }
      });
    });
  });
};
