const multer = require('multer');
const session = require('express-session');

// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // specify the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname) // use the original filename
    // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));

  }
})

const upload = multer({ storage: storage })
// const upload = multer({ storage: storage }).array('photos');

const verifyToken = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers['token'];

  console.log('token',token);

  // Check if token is present
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    req.session = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};


module.exports = app => {
  const telegram = require("../controllers/telegram.controller.js");

  var router = require("express").Router();

  // Store Telegram Data
  router.get("/sync", telegram.syncMessage);

  // Create A Channel
  router.post('/newChannel',telegram.validate('createChannel'),telegram.createChannel);

  // Check Available Username
  router.post('/checkUsername',telegram.validate('checkUsername'),telegram.checkUsername);

  // Update Username
  router.post('/updateUsername',telegram.validate('updateUsername'),telegram.updateUsername);

  // Send Message
  router.post('/sendMsgChannel',telegram.validate('sendMsgChannel'),telegram.sendMsgChannel);

  // Send Photo
  router.post('/sendFile',
    upload.array('file'),
    telegram.validate('sendFile'),
    telegram.sendFile);
  
  // Reply Message
  router.post('/replyMsgChannel',telegram.validate('replyMsgChannel'),telegram.replyMsgChannel);

  // Retrieve all Messages
  router.get("/getMessage", telegram.validate('getMessage'),telegram.getMessage);

  // Retrieve all Chat
  router.get("/getChat", telegram.getChat);

  // Retrieve all Chat Dialogs
  router.get("/getChatDialogs", telegram.getChatDialogs);

  // Resolve Username
  router.get("/resolveUsername", telegram.resolveUsername);

  //Edit Message
  router.post('/editMessage',telegram.validate('editMessage'),telegram.editMessage);

  //Delete Message
  router.post('/deleteMessage',telegram.validate('editMessage'),telegram.editMessage);

  // Retrieve User Detail
  router.get("/getUserDetail", telegram.validate('getUserDetail'),telegram.getUserDetail);

  //Test Function
  router.post("/test", verifyToken,telegram.test);


  app.use('/api/telegram', 
  router,
  session({
    secret: 'telegramDYN',
    resave: true,
    saveUninitialized: true
  })
  );
};