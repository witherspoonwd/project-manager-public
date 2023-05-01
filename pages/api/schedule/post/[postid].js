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

    const query = "SELECT itemID, title, description, dateDue, isComplete, lastClockIn, hoursElapsed FROM private_schedule WHERE itemID = ?";
    const values = [StringID];

    const [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    // make the is archive a string null rather than a real null
    let isComplete;

    if (data[0].isComplete == null){
      isComplete = false;
    }

    else {
      isComplete = true;
    }

    const cleanData = {
      refid: data[0].itemID,
      title: data[0].title,
      content: data[0].description,
      dateDue: formatDate(data[0].dateDue),
      isComplete: isComplete,
      lastClockIn: formatDate(data[0].lastClockIn),
      hoursElapsed: parseFloat(data[0].hoursElapsed).toFixed(2)
    };

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