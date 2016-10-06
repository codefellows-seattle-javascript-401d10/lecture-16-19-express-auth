'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag: '"3324bf5906a5f510b0d6c3bb289ce3dc"',
  VersionId: 'f8t0ZeX1wdfdv5hY6.kP0a7Eitn5ZVES',
  Location: 'https://leegram-assets.s3.amazonaws.com/f4786ecfe56e4bb6369eac229fe3b186.jpg',
  key: 'f4786ecfe56e4bb6369eac229fe3b186.jpg',
  Key: 'f4786ecfe56e4bb6369eac229fe3b186.jpg',
  Bucket: 'leegram-assets',
};

AWS.mock('S3', 'upload', function(params, callback) {
  if (params.ACL !== 'public-read')
    return callback(new Error('ACL must be public read'));
  if (params.Bucket !== 'leegram-assets')
    return callback(new Error('Bucket must be leegram-assets'));
  if (!params.Key)
    return callback(new Error('requires Key'));
  if (!params.Body)
    return callback(new Error('requires Body'));
  callback(null, exports.uploadMock);
});
