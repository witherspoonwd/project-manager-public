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

    const query = "SELECT count(*) FROM private_sessions WHERE isViewable=1";
    const values = [];

    const data = await dbconnection.execute(query, values);
    dbconnection.end();

    const cleanData = data[0].map((item) => ({
      num: item["count(*)"],
    }));


    res.status(200).json(cleanData);
  }

  catch(error){
    res.status(500).json(error);
  }
}