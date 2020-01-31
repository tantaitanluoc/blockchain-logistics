'use strict';

// thư viện
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000


// middleware
const Constants = require('../middleware/constants.js');
const ClientUtils = require('../middleware/clientUtils.js');
const createChannel = require('../middleware/create-channel.js');
const joinChannel = require('../middleware/join-channel.js');
const installCC = require('../middleware/install-chaincode.js');
const instantiateCC = require('../middleware/instantiate-chaincode.js');
const invokeCC = require('../middleware/invoke-chaincode.js');
const queryCC = require('../middleware/query-chaincode.js');
// const upgradeChannel = require('../middleware/upgrade-channel.js');

const lg = console.log;

// Allow all cross origin
app.options('*',cors());
app.use(cors());

app.use(bearerToken());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));

// Yêu cầu token cho mọi đường dẫn ngoại trừ /login và /static
app.use(expressjwt({
   secret: "toan,tai",
   credentialsRequired: false
}).unless({
   path: ['/login','/static']
}),(err,req,res,next)=>{
   if(err) return next();
   return next();
});

app.set('secret','toan,tai');

var server = app.listen(port, ()=>{
   lg(`Listening on port ${port}`);
})

////////////////////////////////////////////////
///////////////////////////////////////////////

function getErrorMessage(field) {
   let response = {
      success: false,
      message: `'${field}' field is missing or Invalid in the request`
   };
   return response;
}

// Cổng xác thực
app.use((req,res,next)=>{
   if(req.originalUrl.indexOf('/login') >= 0) return next();
   if(req.originalUrl.indexOf('/static') >=0) return next();

   let token = req.token;
   if(token){
      jwt.verify(token, app.get('secret'), (err, decoded)=>{
         if(err){
            res.status(403).send({
               success: false,
               type: err.name,
               message: err.message
            })
            return;
         } else {
            // lấy thông tin giải mã được từ token
            req.username = decoded.username;
            req.orgname = decoded.orgname;
            req.password = decoded.password;
            req.role = decoded.role;
            return next();
         }
      });
   } else {
      res.status(404).send({
         success: false,
         message: "Token not found."
      })
      return;
   }
   
});

// đăng nhập hoặc đăng kí người dùng
app.post('/login', async(req, res)=>{
   let username = req.body.username;
   let orgname = req.body.orgname;
   let password = req.body.password;
   let role = req.body.role;
   console.log(req.body)

   if(!username){
      res.status(404).send(getErrorMessage('username'));
      return;
   }
   if(!orgname){
      res.status(404).send(getErrorMessage('orgname'));
      return;
   }
   if(!password && !role){
      res.status(404).send(getErrorMessage('role'));
      return;
   }

   if(username === 'admin' && !password){
      res.status(404).send(getErrorMessage('password'));
      return;
   }

   // tạo token
   ClientUtils.init();
   await ClientUtils.getClientUser(orgname, username, password, role)
   .then(response =>{
      if(response && typeof response !== 'string'){ // đăng nhập hoặc đăng kí thành công
         let resp = {
            success: true,
            token: null
         };
            // lg(`Successfully enrolled the username ${username} for organization ${orgname}`);
         resp.message = 'Login successful';
         let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60*60*60), // token hết hạn sau 60 phút
            username: username,
            orgname: orgname,
            password: password,
            role: role
         }, app.get('secret'));
         resp.token = token;
            resp.org = orgname; 
         res.status(200).send(resp);
      } else {
         lg(`Failed to login as ${username} for organization ${orgname} with: ${response}`);
         let message = 'Login failed';
         if (response) {
            message = JSON.stringify(response);
         }
         res.status(403).send({
            success: false,
            message: message
         })
      }
   })
   .catch(err =>{
      if(err)
         res.status(403).send({
            success: false,
            message: `Authorization failed: ${err.message}` 
         });
      else 
         res.status(403).send({
            success: false,
            message: `Authorization failed for an unknown error.` 
         });
   });
});

app.post('/register', async(req,res) =>{
   let username = req.body.username;
   let orgname = req.body.orgname;
   let role = req.body.role;
   if(!username){
      res.status(404).send(getErrorMessage('username'));
      return;
   }
   if(!orgname){
      res.status(404).send(getErrorMessage('orgname'));
      return;
   }

   if(!role){
      res.status(404).send(getErrorMessage('role'));
      return;
   }

   if(req.username !== 'admin'){
      res.status(403).json({
         success: false,
         message: 'Permission denied. Please contact your network admin for registration.'
      });
      return;
   }

   // tạo token
   ClientUtils.init();
   await ClientUtils.getClientUser(orgname, username, null, role)
   .then(response =>{
      if(response && typeof response !== 'string'){ // đăng nhập hoặc đăng kí thành công
         let resp = {
            success: true,
            token: null
         };
         lg(`Successfully registered the username ${username} for organization ${orgname}`);
         resp.secret = response._enrollmentSecret;
         resp.username = username;
         resp.orgname = orgname;
         resp.role = role;
         resp.message = 'Registration successful';
         let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60*60*60), // token hết hạn sau 60 phút
            username: username,
            orgname: orgname,
            password: response._enrollmentSecret,
            role: role
         }, app.get('secret'));
         resp.token = token;
         res.status(200).send(resp);
      } else {
         lg(`Failed to registered the username ${username} for organization ${orgname} with: ${response}`);
         let message = err.message.match(/message: (.*?)\)/g);
         if(message)
            res.status(403).json({
               success: false,
               message: message[0].replace(/\)$/g,'.')
            })
         else
            res.status(403).json({
               success: false,
               message: 'Unknown error.'
            })
      }
   })
   .catch(err =>{
      if(err)
         res.status(403).send({
            success: false,
            message: `Authorization failed: ${err.message}` 
         });
      else 
         res.status(403).send({
            success: false,
            message: `Authorization failed for an unknown error.` 
         });
   });
});

app.post('/info', async(req,res) => {
   let name = req.username
   let org = req.orgname
   let args = [];
   console.log("--------- GET INFO ---------")
   queryCC.queryChaincode(req.orgname, 'v0', "getUserRole", args, req.username, req.password)
   .then(rs =>{
      queryCC.queryChaincode(req.orgname, 'v0', "getAccountBalance", args, req.username, req.password)
      .then(rss =>{
         res.send({name:name,org:org,role:rs,balance:rss})
         res.end();
      }, err =>{
         res.status(403).send({
            success: false,
            message: err.message
         })
      });
 
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message
      })
   });
   ClientUtils.txEventsCleanup();
});


app.post('/list', async(req,res) => {
   console.log("--------- GET LIST ---------")
   queryCC.queryChaincode(req.orgname, 'v0', "getAllRecords", req.body.args, req.username, req.password)
   .then(rs =>{
      let list = []
      let json = JSON.parse(rs)||["{}"];
      for(let i = 0;i < json.length;i++){
         list.push(JSON.parse(json[i]))
      }
      res.send(list)
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message
      })
   });
   ClientUtils.txEventsCleanup();
});

app.post('/channel/create', async(req,res)=>{
   lg("--------- C H A N N E L   C R E A T I O N ---------");
   if(req.username !== 'admin'){
      res.status(403).send({
         success: false,
         message: `Not an admin user: ${username}`
      });
      return;
   }

   createChannel.createChannel(Constants.CHANNEL_NAME)
   .then(()=>{
      res.status(200).send({
         success: true,
         message: 'Channel created'
      });
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message
      })
   });
})

app.post('/channel/join', async(req,res)=>{
   lg("--------- J O I N   C H A N N E L ---------");
   if(req.username !== 'admin'){
      res.status(403).send({
         success: false,
         message: `Not an admin user: ${username}`
      });
      return;
   }

   joinChannel.processJoinChannel()
   .then(()=>{
      res.status(200).send({
         success: true,
         message: 'Channel joined'
      });
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message
      })
   });
})

app.post('/chaincode/install', async(req,res)=>{
   lg("--------- C H A I N C O D E   I N S T A L L A T I O N ---------");
   if(req.username !== 'admin'){
      res.status(403).send({
         success: false,
         message: `Not an admin user: ${username}`
      });
      return;
   }

   let ccpath = req.body.ccpath;
   let ccversion = req.body.ccversion;

   if(!ccpath){
      res.status(404).send(getErrorMessage('ccpath'));
      return;
   }
   if(!ccversion){
      res.status(404).send(getErrorMessage('ccversion'));
      return;
   }

   installCC.installChaincode(ccpath, ccversion)
   .then(()=>{
      res.status(200).send({
         success: true,
         message: 'Chaincode installed'
      });
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message
      })
   });
})

app.post('/chaincode/instantiate', async(req,res)=>{
   lg("--------- I N S T A N T I A T E   C H A I N C O D E ---------");
   if(req.username !== 'admin'){
      res.status(403).send({
         success: false,
         message: `Not an admin user: ${username}`
      });
      return;
   }

   let ccpath = req.body.ccpath;
   let ccversion = req.body.ccversion;
   let args = req.body.args;
   
   if(!ccpath){
      res.status(404).send(getErrorMessage('ccpath'));
      return;
   }
   if(!ccversion){
      res.status(404).send(getErrorMessage('ccversion'));
      return;
   }
   if(!args){
      res.status(404).send(getErrorMessage('args'));
      return;
   }

   instantiateCC.instantiateOrUpgradeChaincode('importerorg', ccpath, ccversion, 'init', args, false)
   .then(()=>{
      res.status(200).send({
         success: true,
         message: 'Chaincode instantiated'
      });
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message
      })
   });
   ClientUtils.txEventsCleanup();
})

// Invoke chaincode
app.post('/invoke/:fcn', async(req,res)=>{
   lg("--------- I N V O K E   O N   C H A I N C O D E ---------");
   let ccversion = req.body.ccversion;
   let fcn = req.params.fcn;
   let args = req.body.args;
   if(!fcn){
      res.status(404).send(getErrorMessage('fcn'));
      return;
   }
   if(!ccversion){
      res.status(404).send(getErrorMessage('ccversion'));
      return;
   }
   if(!args){
      res.status(404).send(getErrorMessage('args'));
      return;
   }
   invokeCC.invokeChaincode(req.orgname, ccversion, fcn, args, req.username, req.password)
   .then(()=>{
      res.status(200).send({
         success: true,
         message: 'Chaincode invoked'
      });
   }, err =>{
      let message = err.message.match(/message: (.*?)\)/g);
      if(message)
         res.status(403).json({
            success: false,
            message: message[0].replace(/\)$/g,'.')
         })
      else
         res.status(403).json({
            success: false,
            message: 'Unknown error.'
         })

   });
   ClientUtils.txEventsCleanup();
})

// Query chaincode
app.post('/query/:fcn', async(req,res)=>{
   lg("--------- Q U E R Y   B Y   C H A I N C O D E ---------");
   let ccversion = req.body.ccversion;
   let fcn = req.params.fcn;
   let args = req.body.args;
   if(!fcn){
      res.status(404).send(getErrorMessage('fcn'));
      return;
   }
   if(!ccversion){
      res.status(404).send(getErrorMessage('ccversion'));
      return;
   }
   if(!args){
      res.status(404).send(getErrorMessage('args'));
      return;
   }

   queryCC.queryChaincode(req.orgname, ccversion, fcn, args, req.username, req.password)
   .then(rs =>{
      res.status(200).send({
         success: true,
         result: rs
      });
   }, err =>{
      res.status(403).send({
         success: false,
         message: err.message || "Unknown error."
      })
   })
   ClientUtils.txEventsCleanup();
})


app.get('/static',(req,res)=>{
   // phân giải trang chủ
   res.sendFile(path.join(__dirname,'/static/index.html'));
})

// tự động đóng server khi nhận lệnh Ctrl + C từ terminal
process.on('SIGINT', function() {
   console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
   // some other closing procedures go here
   lg("Closing server...");
   server.close();
   process.exit(1);
   
 });