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

    console.log(data);

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

    const cleanData = {
      refid: data[0].projectID,
      title: data[0].title,
      description: data[0].description,
      dateCreated: data[0].dateCreated,
      dueDate: formatDate(data[0].dueDate),
      dateCompleted: formatDate(data[0].dateCompleted),
      hoursWorkedOn: parseFloat(data[0].hoursElapsed),
      projectType: data[0].type,
      songPage: data[0].songRef,
      notepadPage: data[0].notepadRef,
      projectStatus: isComplete
    };

    res.status(200).json(cleanData);
  }

  catch(error){
    console.log(error);
    res.status(500).json({error: error.message});
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