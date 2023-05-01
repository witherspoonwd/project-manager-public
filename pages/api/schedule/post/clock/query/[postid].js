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

    const query = "SELECT hoursElapsed FROM private_schedule WHERE itemID = ?";
    const values = [StringID];

    const [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    const cleanData = {
      hoursElapsed: data[0].hoursElapsed,
    };

    res.status(200).json(cleanData);
  }

  catch(error){
    res.status(500).json();
  }
}