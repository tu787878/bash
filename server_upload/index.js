const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
var fs = require('fs');
const app = express();
const { exec } = require("child_process");
// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

//start app 
const port = 3000;

app.listen(port, () => 
  console.log(`App is listening on port ${port}.`)
);

app.get('/',function(req,res)
{
res.send('Hello World!');
});

app.post('/upload-plugin', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.plugin;
            let input = req.files.input;
            let info = req.files.info;
//var filePath = '/home/bash/bash/src/*'; 
//fs.unlinkSync(filePath);
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('/home/bash/bash/src/' + avatar.name);
            input.mv('/home/bash/bash/src/' + input.name);
            info.mv('/home/bash/bash/src/' + info.name);
            
            
            exec('/home/bash/bash/script', (err, stdout, stderr) => {
 		if (err) {
    			//some err occurred
    			console.error(err)
		res.send({
                	status: false,
                	message: 'It got some errors!',
                	output: {
                     		err:err
                	},
                	log: fs.readFileSync('/home/bash/bash/src/log.txt').toString(),
            });
  		} else {
   			// the *entire* stdout and stderr (buffered)
   		console.log(`stdout: ${stdout}`);
   			console.log(`stderr: ${stderr}`);
            
            //send response
            res.send({
                status: true,
                message: 'Script has been excuted!',
                output: {
                     stdout: stdout,
		     stderr: stderr
                },
                log: fs.readFileSync('/home/bash/bash/src/log.txt').toString(),
            });
                }
            })
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/upload-all', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let data = []; 
    
            //loop all files
//            _.forEach(_.keysIn(req.files.myfiles), (key) => {
	      req.files.myfiles.forEach(element => {

           //   let photo = req.files.myfiles[key];
             let photo = element;   
                //move photo to uploads directory
                photo.mv('/home/bash/bash/src/' + photo.name);

                //push file details
                data.push({
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size
                });
            });
    
            //return response
            res.send({
                status: true,
                message: 'Files are uploaded',
                data: data
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
