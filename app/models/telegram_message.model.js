const sql = require("./db.js");

// constructor
const TelegramMsg = function(telegramMsg) {
    this.telegram_msg_conversation = telegramMsg.telegram_msg_conversation,
    this.telegram_msg_type = telegramMsg.telegram_msg_type,
    this.telegram_msg_ref = telegramMsg.telegram_msg_ref,
    this.telegram_msg_reaction = telegramMsg.telegram_msg_reaction,
    this.telegram_msg_from = telegramMsg.telegram_msg_from,
    this.telegram_msg_to = telegramMsg.telegram_msg_to,
    this.telegram_msg_direction = telegramMsg.telegram_msg_direction,
    this.telegram_msg_content = telegramMsg.telegram_msg_content,
    this.telegram_msg_datetime = telegramMsg.telegram_msg_datetime,
    this.telegram_msg_created = telegramMsg.telegram_msg_created,
    this.telegram_msg_status = telegramMsg.telegram_msg_status,
    this.telegram_msg_sender = telegramMsg.telegram_msg_sender,
    this.telegram_msg_image = telegramMsg.telegram_msg_image,
    this.telegram_msg_image = telegramMsg.telegram_msg_image,
    this.telegram_msg_image = telegramMsg.telegram_msg_image
};

TelegramMsg.create = (newMessage, result) => {

  console.log('newMessage',newMessage);

  checkInteraction(newMessage.telegram_msg_conversation,newMessage.telegram_msg_ref)
  .then((exists) => {
    if (!exists) {
      const social_interaction = {
        soc_med_int_platform : 1,
        soc_med_int_conversation  : newMessage.telegram_msg_conversation,
        soc_med_int_message  : newMessage.telegram_msg_ref,
        soc_med_int_datetime  : newMessage.telegram_msg_datetime,
        // soc_med_int_created : newMessage.telegram_msg_created,
      }
      sql.query("INSERT INTO social_media_interaction SET ?", social_interaction, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

  checkExistsConversation(newMessage.telegram_msg_conversation)
  .then((exists) => {
    if (!exists) {
      const telegram_conversation_obj = {
        telegram_conversation_ref : newMessage.telegram_msg_conversation,
        telegram_conversation_type  : (newMessage.telegram_msg_type == 'User') ? 1 : (newMessage.telegram_msg_type == 'Channel') ? 3 : 2,
        telegram_conversation_sender  : null,
        telegram_conversation_image  : null,
        telegram_conversation_datetime : newMessage.telegram_msg_datetime,
        telegram_conversation_status : 1
      }
      sql.query("INSERT INTO telegram_conversation SET ?", telegram_conversation_obj, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

  checkExistMsg(newMessage.telegram_msg_conversation,newMessage.telegram_msg_ref)
  .then((exists) => {
    if (!exists) {
      const telegram_newMsg_obj = {
        telegram_msg_conversation : newMessage.telegram_msg_conversation,
        telegram_msg_ref : newMessage.telegram_msg_ref,
        telegram_msg_reaction : newMessage.telegram_msg_reaction,
        telegram_msg_from : JSON.stringify(newMessage.telegram_msg_from),
        telegram_msg_to : newMessage.telegram_msg_to,
        telegram_msg_direction : newMessage.telegram_msg_direction,
        telegram_msg_content : newMessage.telegram_msg_content,
        telegram_msg_datetime : newMessage.telegram_msg_datetime
      }

      sql.query("INSERT INTO telegram_message SET ?", telegram_newMsg_obj, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        else
        {
          
        }
        
        result(null, { id: res.insertId, ...newMessage });
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

};

TelegramMsg.createConversation = (newMessage, result) => {

  checkExistsConversation(newMessage.telegram_msg_conversation)
  .then((exists) => {
    if (!exists) {
      const telegram_conversation_obj = {
        telegram_conversation_ref : newMessage.telegram_msg_conversation,
        telegram_conversation_type  : newMessage.telegram_msg_type,
        telegram_conversation_sender  : newMessage.telegram_msg_sender,
        // telegram_conversation_image  : newMessage.telegram_msg_image,
        // telegram_conversation_unread : newMessage.telegram_msg_unread,
        // telegram_conversation_latest_message : newMessage.telegram_msg_lastMsgText,
        telegram_conversation_datetime : newMessage.telegram_msg_datetime,
        telegram_conversation_created : newMessage.telegram_msg_created,
        telegram_conversation_status : 1
      }

      sql.query("INSERT INTO telegram_conversation SET ?", telegram_conversation_obj, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });
};

// Tutorial.findById = (id, result) => {
//   sql.query(`SELECT * FROM tutorials WHERE id = ${id}`, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//       return;
//     }

//     if (res.length) {
//       console.log("found tutorial: ", res[0]);
//       result(null, res[0]);
//       return;
//     }

//     // not found Tutorial with the id
//     result({ kind: "not_found" }, null);
//   });
// };

// Tutorial.getAll = (title, result) => {
//   let query = "SELECT * FROM tutorials";

//   if (title) {
//     query += ` WHERE title LIKE '%${title}%'`;
//   }

//   sql.query(query, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("tutorials: ", res);
//     result(null, res);
//   });
// };

// Tutorial.getAllPublished = result => {
//   sql.query("SELECT * FROM tutorials WHERE published=true", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("tutorials: ", res);
//     result(null, res);
//   });
// };

// Tutorial.updateById = (id, tutorial, result) => {
//   sql.query(
//     "UPDATE tutorials SET title = ?, description = ?, published = ? WHERE id = ?",
//     [tutorial.title, tutorial.description, tutorial.published, id],
//     (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }

//       if (res.affectedRows == 0) {
//         // not found Tutorial with the id
//         result({ kind: "not_found" }, null);
//         return;
//       }

//       console.log("updated tutorial: ", { id: id, ...tutorial });
//       result(null, { id: id, ...tutorial });
//     }
//   );
// };

// Tutorial.remove = (id, result) => {
//   sql.query("DELETE FROM tutorials WHERE id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     if (res.affectedRows == 0) {
//       // not found Tutorial with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }

//     console.log("deleted tutorial with id: ", id);
//     result(null, res);
//   });
// };

// Tutorial.removeAll = result => {
//   sql.query("DELETE FROM tutorials", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} tutorials`);
//     result(null, res);
//   });
// };

function checkInteraction(conversation,msg) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM social_media_interaction WHERE soc_med_int_conversation = ? AND soc_med_int_message = ?';
    sql.query(query, [conversation,msg], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

function checkExistMsg(conversation,msg) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM telegram_message WHERE telegram_msg_conversation = ? AND telegram_msg_ref = ?';
    sql.query(query, [conversation,msg], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

function checkIdExists(id) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM social_media_posts WHERE soc_med_post_msg_id = ?';
    sql.query(query, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

function checkExistsConversation(id) {

  // console.log('id:',id);
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM telegram_conversation WHERE telegram_conversation_ref = ?';
    sql.query(query, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

module.exports = TelegramMsg;
