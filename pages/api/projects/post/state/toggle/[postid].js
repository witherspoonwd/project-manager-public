import mysql from "mysql2/promise"

export default async function handler(req, res) {
  const {postid} = req.query;
  let query, values;

  const dbconnection = await mysql.createConnection({
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    socketPath: process.env.SQL_SOCK,
  });

  try {
    const StringID = String(postid);

    query = "SELECT isComplete FROM project_items WHERE projectID = ?";
    values = [StringID];

    const [data] = await dbconnection.execute(query, values);

    // make this true/false for easy checking.
    let isComplete;

    if (data[0].isComplete == null){
      isComplete = false;
    }

    else {
      isComplete = true;
    }

    if (isComplete == false) {
      const completionDate = parseMySQLDate(new Date());

      query = "UPDATE project_items SET isComplete = 1, dateCompleted =  ? WHERE projectID = ?";
      values = [completionDate, StringID];

      const [push] = await dbconnection.execute(query, values);
      isComplete = true;
    }

    else {
      query = "UPDATE project_items SET isComplete = NULL, dateCompleted = NULL WHERE projectID = ?";
      values = [StringID];

      const [push] = await dbconnection.execute(query, values);
      isComplete = false;
    }

    dbconnection.end();

    res.status(200).json({currentState: isComplete});
  }

  catch(error){
    res.status(500).json();
  }
}

function parseMySQLDate(date){

  const inputDate = new Date(date);
  const adjustedDate = new Date(inputDate.getTime() - 5 * 60 * 60 * 1000);
  const mysqlDatetimeString = adjustedDate.toISOString().slice(0, 19).replace('T', ' ');

  return String(mysqlDatetimeString);
}