import mysql from "mysql2/promise"

export default async function handler(req, res) {

  const {refid} = req.query;

  const dbconnection = await mysql.createConnection({
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    socketPath: process.env.SQL_SOCK
  });

  try {

    const StringID = String(refid);

    const query = "SELECT songID, songTitle, htmlContent, dateCreated FROM private_songs WHERE songID = ?";
    const values = [StringID];

    const [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    const cleanData = {
      refid: data[0].songID,
      title: data[0].songTitle,
      content: data[0].htmlContent,
      date: formatDate(data[0].dateCreated)
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