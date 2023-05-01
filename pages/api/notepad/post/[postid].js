import mysql from "mysql2/promise"

export default async function handler(req, res) {

  const {postid} = req.query;

  const dbconnection = await mysql.createConnection({
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    socketPath: process.env.SQL_SOCK
  });

  try {

    const StringID = String(postid);

    const query = "SELECT noteID, noteTitle, htmlContent, dateCreated, isArchived FROM private_notepad WHERE noteID = ?";
    const values = [StringID];

    const [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    // make the is archive a string null rather than a real null
    let isArchived;

    if (data[0].isArchived == null){
      isArchived = "NULL";
    }

    else {
      isArchived = "1";
    }

    const cleanData = {
      refid: data[0].noteID,
      title: data[0].noteTitle,
      content: data[0].htmlContent,
      date: formatDate(data[0].dateCreated),
      isArchived: isArchived
    };

    res.status(200).json(cleanData);
  }

  catch(error){
    res.status(500).json();
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