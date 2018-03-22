'use strict'

require('dotenv').config()

const fs = require('fs')
const crypto = require('crypto')

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const path = require('path')

const mime = require('mime-types')

const file = {
  path: process.argv[2],
  name: process.argv[3]
}

file.stream = fs.createReadStream(file.path)
file.ext = path.extname(file.path)
file.mimeType = mime.lookup(file.path)

const promiseRandomBytes = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        reject(err)
      }
      resolve(buf.toString('hex'))
    })
  })
}

const promiseS3Upload = (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

promiseRandomBytes()
  .then((randomString) => {
    return {
      ACL: 'public-read',
      ContentType: file.mimeType,
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: randomString + file.ext,
      Body: file.stream
    }
  })
  .then(promiseS3Upload)
  .then((prev) => {
    console.log('prev is ', prev)
    return prev
  })
  .catch(console.error)
