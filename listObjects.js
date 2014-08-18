var AWS = require('aws-sdk'),
    s3;

//S3 credentials loaded from config.
AWS.config.loadFromPath('./node_modules/aws-config.json');

exports.getFileList = function(req, res) {
    var params = {
        endpoint:'https://s3-us-west-2.amazonaws.com',
        sslEnabled:true
    };

    //Create an S3 client service.
    s3 = new AWS.S3.Client(params);

    var listObjCallback = function (error, data) {
        var _data = {};

        if (error) {
            _data.code = error.code;
            _data.message = error.message;
            _data.statusCode = error.statusCode;
        }

        if (data) {
            _data.list = [];
            if (data.Contents) {
                _data.total = data.Contents.length;
                for (var i = 0; i < data.Contents.length; i++) {
                    _data.list.push(data.Contents[i].Key);
                }
                _data.list = _data.list.sort().reverse();
            } else {
                _data.list.push('No files are available.');
            }
        } else {
            _data.message = 'No error reported, but no data, either.';
        }

        res.send({ data:_data });
    };

    s3.listObjects({Bucket: 's3.bucket.name.goes.here'}, listObjCallback);
};
