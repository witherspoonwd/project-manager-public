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
    const pageNum = parseInt(req.headers['page'], 10);
    //const page = Number(req.query.page);

    let data;

    if (!pageNum) {
      const query = "SELECT sessionID, sessionTitle, dateCreated, isRecent FROM private_sessions ORDER BY dateCreated DESC";
      const values = [];

      data = await dbconnection.execute(query, values);
      dbconnection.end();
    }

    else {
      const indexFrom = String((pageNum - 1) * 25);
      const amountToDisplay = "25";

      const query = "SELECT sessionID, sessionTitle, dateCreated, isRecent FROM private_sessions ORDER BY dateCreated DESC LIMIT ?, ?";
      const values = [indexFrom, amountToDisplay];

      data = await dbconnection.execute(query, values);
      dbconnection.end();
    }

    // clean up
    const cleanData = data[0].map((item) => ({
      date: formatDate(item.dateCreated),
      title: item.sessionTitle,
      refID: item.sessionID,
      isComplete: item.isRecent
    }));

    res.status(200).json(cleanData);
  }

  catch(error){
    res.status(500).json(error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const formattedDate = `${month}.${day}.${year}`;
  return formattedDate;
}