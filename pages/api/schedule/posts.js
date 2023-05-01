import mysql from "mysql2/promise"

export default async function handler(req, res) {

  const dbconnection = await mysql.createConnection({
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    socketPath: process.env.SQL_SOCK
  });

  try {
    const viewall = req.headers['viewall'];
    //const page = Number(req.query.page);

    let data;

    if (!viewall) {
      const query = "SELECT itemID, title, dateDue, lastClockIn, isComplete FROM private_schedule WHERE isComplete IS NULL ORDER BY dateDue ASC";
      const values = [];

      data = await dbconnection.execute(query, values);
      dbconnection.end();
    }

    else {
      const query = "SELECT itemID, title, dateDue, lastClockIn, isComplete FROM private_schedule ORDER BY dateCreated DESC";
      const values = [];

      data = await dbconnection.execute(query, values);
      dbconnection.end();
    }

    // clean up
    const cleanData = data[0].map((item) => ({
      date: formatDate(item.dateDue),
      title: item.title,
      refID: item.itemID,
      clocked: isClocked(item.lastClockIn),
      pastDue: isPastDue(item.dateDue),
      isComplete: isComplete(item.isComplete)
    }));

    res.status(200).json(cleanData);
  }

  catch(error){
    res.status(500).json(error);
  }
}

function isComplete (complete){
  return complete == 1 ? true : false
}

function isPastDue(dueDate) {
  const date = new Date(dueDate);
  const now = new Date();
  if (now > date) {
    return true;
  }

  else {
    return false;
  }
}

function isClocked(clockVar){
  if (clockVar == null){
    return false;
  }

  else {
    return true;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  let hour = date.getHours();
  hour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedDate = `${month}.${day}.${year} ${hour.toString().padStart(2, "0")}:${minutes}${ampm}`;
  return formattedDate;
}