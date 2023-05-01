import mysql from "mysql2/promise"

export default async function handler(req, res) {
  const {postid} = req.query;

  const dbconnection = await mysql.createConnection({
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    socketPath: process.env.SQL_SOCK,
  });

  try {

    const StringID = String(postid);

    const query = "SELECT projectID, title, description, dateCreated, dateCompleted, type, hoursElapsed, dueDate, songRef, notepadRef, isComplete FROM project_items WHERE projectID = ?";
    const values = [StringID];

    const [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    //console.log(data[0].isComplete);

    // make this true/false for easy checking.
    let isComplete;

    if (data[0].isComplete == null){
      isComplete = false;
    }

    else {
      isComplete = true;
    }

    //console.log(isComplete);

    // clean up
    const cleanData = data[0].map((item) => ({
      date: formatDate(item.dateCreated),
      title: item.noteTitle,
      refID: item.noteID,
      isArchived: item.isArchived
    }));

    res.status(200).json(cleanData);
  }

  catch(error){
    res.status(500).json();
  }
}

function formatDate(dateString) {
  if (dateString == null){
    return null;
  }

  const date = new Date(dateString);
  //console.log("raw date: " + date);
  const isoString = date.toISOString();
  //console.log("iso date: " + isoString);
  return isoString;
}