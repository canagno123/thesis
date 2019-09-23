var express = require('express');
var app = express();
var formidable = require('formidable');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const fs = require('fs');

// define routes here..
app.use(express.static('/home/canagno/ethChain/truffle/build/contracts'));
app.use(express.static(__dirname))

// enable files upload
app.use(fileUpload());

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));


// POST method route
app.post('/upload', function (req, res) {
	if(req.files){
	  var file = req.files.filename;
	  filename = file.name;
	  file.mv("/home/canagno/ethChain/truffle/ui/upload/"+filename,function(err){
	    if(err){
	      console.log(err)
              res.send("Error storing the file.");
	    }
            else{
	      res.send("Successfully uploaded file.")
	    }
	  })
	}
})
app.get('/download', function(req, res){
  var files = fs.readdirSync('/home/canagno/ethChain/truffle/ui/upload');
  console.log(files);
  var file = '/home/canagno/ethChain/truffle/ui/upload/';
  file += req.query.downloadFile;
  res.download(file); // Set disposition and send it.
});
var server = app.listen(3000, function () {
    console.log('Node server is running..');
});
