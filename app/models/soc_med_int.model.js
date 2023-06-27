const sql = require("./db.js");

// constructor
const Interaction = function(interaction) {
  this.soc_med_int_datetime = tutorial.soc_med_int_datetime;
  this.soc_med_int_post = tutorial.soc_med_int_post;
};

Interaction.create = (newTutorial, result) => {

  checkIdExists(newTutorial.soc_med_post_msg_id)
  .then((exists) => {
    if (exists) {
      console.log('The ID exists in the database.');
    } else {
      console.log('The ID does not exist in the database.');
      sql.query("INSERT INTO social_media_interaction  SET ?", newTutorial, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
    
        console.log("created tutorial: ", { id: res.insertId, ...newTutorial });
        result(null, { id: res.insertId, ...newTutorial });
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

};

Interaction.findById = (id, result) => {
  sql.query(`SELECT * FROM social_media_interaction  WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found tutorial: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Tutorial with the id
    result({ kind: "not_found" }, null);
  });
};

Interaction.getAll = (title, result) => {
  let query = "SELECT * FROM social_media_interaction ";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("tutorials: ", res);
    result(null, res);
  });
};


// Tutorial.updateById = (id, tutorial, result) => {
//   sql.query(
//     "UPDATE social_media_interaction  SET title = ?, description = ?, published = ? WHERE id = ?",
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

Interaction.remove = (id, result) => {
  sql.query("DELETE FROM social_media_interaction WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Tutorial with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted tutorial with id: ", id);
    result(null, res);
  });
};

Interaction.removeAll = result => {
  sql.query("DELETE FROM social_media_interaction", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} tutorials`);
    result(null, res);
  });
};

function checkIdExists(id) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM social_media_interaction  WHERE soc_med_int_post = ?';
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

module.exports = Interaction;
