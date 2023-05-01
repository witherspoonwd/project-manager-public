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

  if ((req.method) == 'POST') {
    try {

      const isArchived = req.headers['x-is-archived'];
      const StringID = String(postid);

      const set = isArchived == "1" ? null : "1"; 
      const action = isArchived == "1" ? "removed" : "added";

      const query = "UPDATE private_notepad SET isArchived = ? WHERE noteID = ?";
      const values = [set, StringID];

      const [data] = await dbconnection.execute(query, values);
      dbconnection.end();

      res.status(200).json({archiveSuccess: "true", action: action});
    }

    catch(error){
      res.status(500).json({archiveSuccess: "false", error: error.message});
    }
  }

  else {
    res.status(500).json({archiveSuccess: "false"});
  }
}