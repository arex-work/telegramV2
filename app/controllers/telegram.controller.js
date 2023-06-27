const { Api,TelegramClient,update } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { validationResult,body,query,check } = require('express-validator');
// const Tutorial = require("../models/tutorial.model.js");
const TelegramMsg = require("../models/telegram_message.model.js");
const input = require("input"); // npm i input
const moment = require('moment'); // require
// const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

// const fetch = require('node-fetch');

// const apiId = 20010202;
// const apiHash = "6ce39be71a3e47bd94fd284bddd80ab9";
// const stringSession = new StringSession("1BQANOTEuMTA4LjU2LjE3MgG7BRJhbXotwVF1OSbbqup8oRNFbzGVMidIJ+kt08YxG8CnTr8XtVJlVTgG5m9zu6ai42dIsmmgvVgQUqsInZHdTxFRRbAIJeIqHC6jxLwqhpYtez1liX15XHXMdpcopAbm/slJgF/C2+3kt//w5tZEBuhSGEH/XmPKnOUVLSLXVE9bEicE43ufFKYgv9Vk0HeysKcUGzn310IluccWvkQsTkZh0wM7AcU27/byU0S/I+swToO0fL6gvKZB8n1FP2nY51lycL0CvDp4kT+jMJub+58JuCSRhf18LHs0byx1vNIFX8IKNQrmF1KaDyZh6VgBD/gaG3hk4QBZgK7ACA7nmg=="); // fill this later with the value from session.save()

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION_ID); // fill this later with the value from session.save()

//Create A Channel
exports.createChannel = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {
        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
            useWSS:true
          });
        
          await client.start({
            phoneNumber: async () => await input.text("number ?"),
            password: async () => await input.text("password?"),
            phoneCode: async () => await input.text("Code ?"),
            onError: (err) => console.log(err),
          });
          
          const result = await client.invoke(
              new Api.channels.CreateChannel({
                title: req.body.name,
                about: req.body.description,
                broadcast : false,
                forImport: false,
                geoPoint: new Api.InputGeoPoint({
                  lat: 8.24,
                  long: 8.24,
                  accuracyRadius: 43,
                }),
                address: "",
              })
            );
            console.log(result); // prints the result
            res.send({status:"success"})
        } catch (error) {
          res.send({status:"error"});
        }
      })();
    }
 } catch(err) {
   return next(err)
 }
};

// Send Message To Recipient or Group Post
exports.sendMsgChannel = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {
        try {
          console.log("Loading interactive example...");
          const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
            useWSS:true
          });
          
          await client.connect();
          await client.sendMessage(req.body.username, { message: req.body.message });
  
          // console.log(result); // prints the result
            res.send({status:"success"})
        } catch (error) {
          
          res.send({status:"error",message:"Invalid Username"});
        }

      })();
    }
 } catch(err) {
   return next(err)
 }
};

// Send File or Photo with caption
exports.sendFile = (req, res, next) => {
  
  try {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      let files = [];

      req.files.forEach(element => {
        files.push(element.path)
      });
  
      console.log(files);
      (async () => {

        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,useWSS:true});
      
          const chatId = req.body.recipient;
          const description = req.body.description || '';
          await client.connect();
          await client.sendFile(chatId, {file:files, caption:description})
          await client.disconnect();
          res.send({status:"success"})
        } catch (error) {
          res.send({status:"error"});
        }
      })();

    }
  } catch(err) {
   return next(err)
  }
};

// Reply A Message
exports.replyMsgChannel = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {

        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
      
          await client.connect(); // This assumes you have already authenticated with .start()
          await client.sendMessage(req.body.username, 
          { 
            message: req.body.message,
            replyTo: req.body.replyMsgId
          });
  
          res.send({status:"success"})
        } catch (error) {
          res.send({status:"error"})
          
        }

      })();
    }
 } catch(err) {
   return next(err)
 }
};

// Retrieve all Message History
exports.getMessage = (req, res, next) => {

  let data = [];
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      console.log({req:req.body});
      (async function run() {

        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
            useWSS:true
          });
          await client.connect(); // This assumes you have already authenticated with .start()
      
          const channelUsername = req.query.username; // Replace with the username of the channel you want to get the history of
        
          const entity = await client.getEntity(channelUsername);
  
          console.log('entity obj',entity);
          console.log('entity',entity.id);
  
      
          const messages = await client.getMessages(entity, {offset: req.query.offset, limit: req.query.limit});
  
          console.log(messages);
      
          messages.forEach(element => {
            const date = new Date(element.date * 1000); // Convert the timestamp to milliseconds and create a new Date object
            // const formattedDate = date.toISOString().slice(0, 19).replace('T', ' '); // Format the date as a MySQL date string
            const formattedDate = moment.unix(element.date).format('YYYY-MM-DD HH:mm:ss');
  
  
            if(req.query.sync)
            {
              const telegramMsg = new TelegramMsg({
                telegram_msg_conversation: entity.id.value,
                telegram_msg_type:entity.className,
                telegram_msg_ref: element.id,
                // telegram_msg_reaction:(element.reactions != null) ? element.reactions.results : null,
                telegram_msg_reaction: null,
                telegram_msg_from: element.fromId,
                telegram_msg_to: null,
                telegram_msg_direction: (element.out) ? 1 : 2,
                telegram_msg_content: element.message,
                telegram_msg_datetime:formattedDate,
                telegram_msg_created : new Date().toISOString().slice(0, 19).replace('T', ' ')
  
                // soc_med_post_channel: channelUsername,
                // soc_med_post_conversation_id: element.id,
                // soc_med_post_msg_id: element.id,
                // soc_med_post_platform : 1,
                // soc_med_post_sender : null,
                // soc_med_post_recipient:null,
                // soc_med_post_content: element.message,
                // soc_med_post_type: "-",
                // soc_med_post_datetime:formattedDate
              });
  
               // Save Tutorial in the database
               TelegramMsg.create(telegramMsg, (err, data) => {
                // if (err)
                //   res.status(500).send({
                //     message:
                //       err.message || "Some error occurred while creating the Tutorial."
                //   });
                // else 
                // res.send({
                //   result:"success"
                // });
              });
            }
            data.push({
              "id": element.id,
              "message" : element.message,
              "datetime" : formattedDate,
              "replyToMsgId" : (element.replyTo != null) ? element.replyTo.replyToMsgId : null,
              "view": element.views,
              "forward": element.forwards,
              "edited":!element.editHide
            })
          });
  
          (req.query.dev) ? res.send(messages) : res.send(data);
          // (req.query.hasOwnProperty('dev') && req.query.dev == true) ? res.send(messages) : res.send(data); 
        } catch (error) {
            // return next(error)
            res.send({status:"error",message:"Invalid Username"});
        }


      })();
    }
 } catch(err) {
   return next(err)
 }


};

//Sync Message to Database
exports.syncMessage = (req, res) => {
  (async function run() {

    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      useWSS:true
    });
    await client.connect(); // This assumes you have already authenticated with .start()
    // Listen for updates in real-time
    client.on(update.NewMessage, async (event) => {
      console.log(`New message received from ${event.message.peerId.userId}: ${event.message.message}`);
    });
  })();
};

// Retrieve all Chat
exports.getChat = (req, res) => {
  (async function run() {
    try {
      const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
      await client.connect();
      const result = await client.invoke(new Api.messages.GetAllChats({exceptIds: [BigInt("-4156887774564")],}));
      let data = [];
      result.chats.forEach(element => {
        if(element.deactivated === undefined)
        {
          // let photo_url =  client.download_profile_photo(element.photo)

          data.push({
            id:element.id,
            photo: element.photo,
            // photo_url:photo_url,
            title:element.title,
            username:element.username
          })
        }
      });
      res.send({
        status:'success',
        results:data
      });
    } catch (error) {
      console.log(error);
      res.send({
        status:'error',
        remark:'No Data Available',
        public_remark:'No Data Available'
      });
    }
  })();
};

// Retrieve all Chat
exports.getChatDialogs = (req, res) => {
  (async function run() {
    try {
      const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
      await client.connect();
      const dialogs = await client.getDialogs({});

      let data = [];

      console.log(dialogs);
      dialogs.forEach(element => {

        if(req.query.sync)
        {
          const telegramMsg = new TelegramMsg({
            telegram_msg_conversation:parseInt(element.entity.id),
            telegram_msg_type:0,
            telegram_msg_sender:element.entity.username,
            telegram_msg_image:element.entity.photo,
            // telegram_msg_unread:element.dialog.unreadCount,
            // telegram_msg_lastMsgText:element.message.message,
            telegram_msg_datetime:moment.unix(element.message.date).format('YYYY-MM-DD HH:mm:ss'),
            telegram_msg_created : new Date().toISOString().slice(0, 19).replace('T', ' '),
            telegram_msg_status: 1
          });

          TelegramMsg.createConversation(telegramMsg, (err, data) => {
            if (err)
              res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the Tutorial."
              });
            else 
            res.send({
              result:"success"
            });
          });
        }
        data.push({
          id:element.entity.id,
          username:element.entity.username,
          title:element.entity.title,
          message:element.message.message,
          unread:element.dialog.unreadCount,
          datetime:moment.unix(element.message.date).format('YYYY-MM-DD HH:mm:ss'),
          photo:element.entity.photo
        })
      });

      res.send(data);
    } catch (error) {
      console.log(error);
      res.send({
        status:'error',
        remark:'No Data Available',
        public_remark:'No Data Available'
      });
    }
  })();
};

// Resolve Username 
exports.resolveUsername = (req, res) => {

  (async function run() {

    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      useWSS:true
    });
    await client.connect(); // This assumes you have already authenticated with .start()

    const result = await client.invoke(
      new Api.contacts.ResolveUsername({
        username: "arexdyn",
      })
    );
    res.send(result)
    console.log(result); // prints the result
  })();

};

// Delete Messages
exports.deleteMessage = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {

        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
          const chat = req.body.chat;
          const messages = req.body.message;
          await client.connect();
          await client.deleteMessages(chat, messages, {revoke:req.body.revoke});
          await client.disconnect();
          res.send({status:"success"})
        } catch (error) {
            res.send({status:"error"})
        }

      })();
    }
 } catch(err) {
   return next(err)
 }
};

// Edit Messages
exports.editMessage = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {

        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
          const chat = req.body.chat;
          const message = req.body.message;
          const text = req.body.text;
  
          await client.connect();
          await client.editMessage(chat,{message:message,text: text})
          await client.disconnect();
          res.send({status:"success"})
          // console.log(result);
        } catch (error) {
          res.send({status:"error"})
        }
      })();
    }
 } catch(err) {
  //  return next(err)
  res.send({status:"error"})

 }
};

//Check Username
exports.checkUsername = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {

        try {
            const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
            const channel = req.body.channel;
            const username = req.body.username;
            await client.connect();
    
            const result = await client.invoke(
              new Api.channels.CheckUsername({
                channel: channel,
                username:username,
              })
            );
    
            (result) ? res.send({status:'success',availability: true}) : res.send({status:'error',availability:false})  
        } catch (error) {
          res.send({status:'error',availability:false})
        }
        
      })();
    }
 } catch(err) {
  //  return next(err)
  console.log('106',err);
 }
};

//Check Username
exports.updateUsername = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      (async () => {

        try {
            const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
            const channel = req.body.channel;
            const username = req.body.username;
            await client.connect();
    
            const result = await client.invoke(
              new Api.channels.UpdateUsername({
                channel: channel,
                username:username,
              })
            );

            console.log('result',result);
    
            (result) ? res.send({status:'success',availability: true}) : res.send({status:'error',availability:false})  
        } catch (error) {
          console.log('error',error);
          res.send({
            status:"error",
            remark:error.errorMessage,
            public_remark:"Please Choose Other Username"
          });
          // res.send({status:'error',availability:false})
        }
        
      })();
    }
 } catch(err) {
  //  return next(err)
 }
};

// Retrieve User Detail
exports.getUserDetail = (req, res) => {

  let data = [];
  
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    else
    {
      
      (async function run() {

        try {
          const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
          await client.connect();   
  
          const username = req.query.username;
          const result = await client.invoke(new Api.users.GetUsers({id: [username],}));
  
          console.log(result); // prints the result
          res.send({
            status:'success',
            result:{
              id:result[0].id,
              firstName:result[0].firstName,
              lastName:result[0].lastName,
              username:result[0].username,
              phone:result[0].phone,
              photo:result[0].photo,
              // wasOnline:moment.unix(result[0].status.wasOnline).format('YYYY-MM-DD HH:mm:ss') || null
            }
          })
        } catch (error) {
          console.log(error);
          res.send({
            status:'error',
            remark:error,
            public_remark:'Invalid Username / User Id',
          })
        }

      })();
    }
 } catch(err) {
   return next(err)
 }


};

//Test Function
exports.test = (req, res, next) => {
  console.log('this is test');
  const client = new TelegramClient(stringSession, apiId, apiHash, {connectionRetries: 5,useWSS:true});
  
  const myValue = req.session.myValue;
  console.log(req.session);

    (async () => {

    })();



};

exports.validate = (method) => {
  switch (method) {
    case "createChannel":
      return [ 
        body('name', 'No Name').exists(),
        body('description', 'No Description').exists(),
       ] 
      break;

      case "sendMsgChannel":
        return [ 
          body('username', 'Please Fill Username').exists(),
          body('message', 'Please Fill Message').exists(),
         ] 
        break;

      case "replyMsgChannel":
        return [ 
          body('username', 'Please Fill Username').exists(),
          body('message', 'Please Fill Message').exists(),
          body('replyMsgId', 'Please Fill Reply Message ID').exists(),
          ] 
        break;

      case "getMessage":
        return [ 
          query('username', 'Please Fill Username').exists(),
          query('offset', 'Please Fill Offset').exists(),
          query('limit', 'Please Fill Limit').exists(),
          query('sync').optional().isBoolean(),
          query('dev').optional().isBoolean(),
          ] 
        break;

        case "sendFile":
          return [
            body('recipient', 'Please Fill Recipient').exists(),
            body('file').custom((value, { req }) => {
              if (!req.files || req.files.length === 0) {
                throw new Error('At least one file must be uploaded.');
              }
              const allowedTypes = ['image/jpeg', 'image/png', 
              'video/mp4','video/x-flv','application/x-mpegURL',
              'application/pdf', 'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ];

              // Check each file for size and type
              for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                // if (file.size > 1000000) {
                //   throw new Error('File size cannot exceed 1 MB.');
                // }
                if (!allowedTypes.includes(file.mimetype)) {
                  throw new Error('File type not supported');
                }
              }
        
              // Validation passed
              return true;
            })
            ] 
          break;

        case "deleteMessage":
          return [ 
            body('chat', 'Please Fill Chat Id').exists(),
            body('message', 'Please Fill Message Id').exists(),
            body('revoke').optional().isBoolean(),
            
            ] 
          break;

        case "editMessage":
          return [ 
            body('chat', 'Please Fill Chat Id').exists(),
            body('message', 'Please Fill Message Id').exists(),
            body('text', 'Please Fill Message Id').exists(),
            ] 
          break;

        case "checkUsername":
          return [ 
            body('channel', 'Please Fill Channel Id').exists(),
            body('username', 'Please Fill Username').exists(),
            ] 
          break;

        case "updateUsername":
          return [ 
            body('channel', 'Please Fill Channel Id').exists(),
            body('username', 'Please Fill Username').exists(),
            ] 
          break;

        case "getUserDetail":
          return [ 
            query('username', 'Please Fill Username').exists()
            ] 
          break;
        
  
    default:
      break;
  }
}