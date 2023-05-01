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

      let query, values, data2;

      const isClocked = req.headers['x-is-clocked'];
      const StringID = String(postid);

      const currentTime = getCurrentMySQLTime();
      const currentJStime = new Date();

      //let action = (isClocked == "false") ? "clockedin" : "clockedout";
      
      try {
        query = "SELECT hoursElapsed, lastClockIn FROM private_schedule WHERE itemID = ?";
        values= [StringID];

        const [result] = await dbconnection.execute(query, values);
        data2 = result;
      }

      catch (error) {
        res.status(500).json({clockSuccess: "false", error: error.message});
      }

      let action = (data2[0].lastClockIn == null) ? "clockedin" : "clockedout";

      if (action == "clockedout"){
        const hoursElapsedCalc = getDateDistanceInDays(new Date(formatDate(data2[0].lastClockIn)), new Date(formatDate(new Date())));

        let newHoursElapsed = parseFloat(data2[0].hoursElapsed).toFixed(2);
        newHoursElapsed = parseFloat(newHoursElapsed) + parseFloat(hoursElapsedCalc);

        query = "UPDATE private_schedule SET lastClockIn = ?, hoursElapsed = ? WHERE itemID = ?";
        values = [null, newHoursElapsed, StringID];

        const [data] = await dbconnection.execute(query, values);

        dbconnection.end();
        res.status(200).json({clockSuccess: "true", clockTime: false, hoursElapsed: newHoursElapsed});
      }

      else if (action == "clockedin"){
        query = "UPDATE private_schedule SET lastClockIn = ? WHERE itemID = ?";
        values = [currentTime, StringID];

        const [data] = await dbconnection.execute(query, values);

        dbconnection.end();
        res.status(200).json({clockSuccess: "true", clockTime: currentJStime, hoursElapsed: false});
      }      

      else {
        res.status(500).json({clockSuccess: "false", error: "generic clock error."});
      }
    }

    catch(error){
      res.status(500).json({archiveSuccess: "false", error: error.message});
    }
  }

  else {
    res.status(500).json({archiveSuccess: "false"});
  }
}

function getDateDistanceInDays(date1, date2) {
  const oneDayMs = 1000 * 60 * 60;
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  const daysDiff = (timeDiff / oneDayMs);
  return parseFloat(daysDiff).toFixed(2);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const isoString = date.toISOString();
  return isoString;
}

function getCurrentMySQLTime(date){

  const inputDate = new Date();
  const adjustedDate = new Date(inputDate.getTime() - 5 * 60 * 60 * 1000);
  const mysqlDatetimeString = adjustedDate.toISOString().slice(0, 19).replace('T', ' ');

  return String(mysqlDatetimeString);
}