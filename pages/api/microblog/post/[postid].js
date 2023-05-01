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

    const query = "SELECT postID, postTitle, postContent, isViewable, quoteTweetRef, postDateTime FROM microblog_posts WHERE postID = ?";
    const values = [StringID];

    const [data] = await dbconnection.execute(query, values);
    dbconnection.end();

    res.status(200).json(data[0]);
  }

  catch(error){
    res.status(500).json();
  }
}