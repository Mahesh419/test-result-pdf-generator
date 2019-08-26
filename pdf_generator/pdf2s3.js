const fs = require('fs');
const aws = require('aws-sdk');

const ACCESS_KEY = 'AKIAXYZQQLW4TMJDCUPW';
const SECRET_ACCESS_KEY = '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';

const s3 = new aws.S3({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY
});

module.exports = {
    uploadFile : (filePath) => {
        fs.readFile(filePath, (err, data) => {
           if (err) throw err;
           const params = {
               Bucket: 'coders-glory-result-pdf-bucket', 
               Key: `Test_result_${new Date().getTime()}.pdf`,
               Body: data
           };
           s3.upload(params, function(s3Err, data) {
               if (s3Err) throw s3Err
               console.log(`File uploaded successfully at ${data.Location}`)
           });
        });
      }
};

