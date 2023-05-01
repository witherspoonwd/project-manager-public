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

      let query, values, data2, isComplete;

      const StringID = String(postid);

      const currentTime = getCurrentMySQLTime();
      const currentJStime = new Date();

      //let action = (isClocked == "false") ? "clockedin" : "clockedout";
      
      try {
        query = "SELECT hoursElapsed, lastClockIn, isComplete FROM private_schedule WHERE itemID = ?";
        values= [StringID];

        const [result] = await dbconnection.execute(query, values);
        data2 = result;
      }

      catch (error) {
        res.status(500).json({clockSuccess: "false", error: error.message});
      }

      console.log(data2);

      if (data2[0].isComplete == null){
        isComplete = false;
      }
  
      else {
        isComplete = true;
      }

      let prevState = (data2[0].lastClockIn == null) ? "clockedout" : "clockedin";
      let action = (data2[0].isComplete == true) ? "reopen" : "close";
      let elapseUpdate = false;
      console.log(prevState);
      console.log(action);

      if (action == "close"){

        if (prevState == "clockedin"){
          const hoursElapsedCalc = getDateDistanceInDays(new Date(formatDate(data2[0].lastClockIn)), new Date(formatDate(new Date())));
          console.log(hoursElapsedCalc);
          let newHoursElapsed = parseFloat(data2[0].hoursElapsed).toFixed(2);
          newHoursElapsed = parseFloat(newHoursElapsed) + parseFloat(hoursElapsedCalc);
          console.log(newHoursElapsed);

          query = "UPDATE private_schedule SET lastClockIn = ?, hoursElapsed = ? WHERE itemID = ?";
          values = [null, newHoursElapsed, StringID];

          const [data] = await dbconnection.execute(query, values);

          elapseUpdate = newHoursElapsed;
        }

        query = "UPDATE private_schedule SET isComplete = 1 WHERE itemID = ?";
        values = [StringID];

        const [data] = await dbconnection.execute(query, values);

        dbconnection.end();
        res.status(200).json({action: action, hoursElapsed: elapseUpdate});
      }

      else if (action == "reopen"){
        query = "UPDATE private_schedule SET isComplete = ? WHERE itemID = ?";
        values = [null, StringID];

        const [data] = await dbconnection.execute(query, values);

        dbconnection.end();
        res.status(200).json({action: action, hoursElapsed: elapseUpdate});
      }      

      else {
        res.status(500).json({action: "false", error: "generic error"});
      }
    }

    catch(error){
      res.status(500).json({action: "false", error: error.message});
    }
  }

  else {
    res.status(500).json({action: "false"});
  }
}

function getDateDistanceInDays(date1, date2) {

  /* console.log(date1);
  console.log(date2); */

  const oneDayMs = 1000 * 60 * 60;
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  const daysDiff = (timeDiff / oneDayMs);
  console.log(daysDiff);
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