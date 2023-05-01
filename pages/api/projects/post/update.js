// file importz
import multer from "multer";
import mysql from "mysql2/promise";


export default async function handler(req, res) {
  try {
    const dbconnection = await mysql.createConnection({
      host: process.env.SQL_HOST,
      database: process.env.SQL_DB,
      user: process.env.SQL_USR,
      password: process.env.SQL_PASS,
      socketPath: process.env.SQL_SOCK
    });

    if (req.method === 'POST') {

      /* const { title, content, refid } = req.body; */

      /* const cleanData = {
        refid: data[0].projectID,
        title: data[0].title,
        description: data[0].description,
        dateCreated: data[0].dateCreated,
        dueDate: formatDate(data[0].dueDate),
        hoursWorkedOn: parseFloat(data[0].hoursElapsed),
        projectType: data[0].type,
        songPage: data[0].songRef,
        notepadPage: data[0].notepadRef
      }; */

      const refid = req.body.refid;
      const title = req.body.title;
      const description = req.body.description;
      const dueDate = req.body.dueDate;
      const hoursWorkedOn = req.body.hoursWorkedOn;
      const projectType = req.body.projectType;
      const songPage = req.body.songPage;
      const notepadPage = req.body.notepadPage;
      const projectStatus = req.body.projectStatus == true ? "1" : null;
      const completionDate = req.body.projectStatus == true ? parseMySQLDate(new Date()) : null;



      //console.log(title, description, parseMySQLDate(dueDate), projectType, hoursWorkedOn, songPage, notepadPage, refid);

      const query = "UPDATE `project_items` SET `title` = ?, `description` = ?, `dueDate` = ?, `type` = ?, `hoursElapsed` = ?, `songRef` = ?, `notepadRef` = ?, isComplete = ?, dateCompleted = ? WHERE projectID = ?";
      let values = [title, description, parseMySQLDate(dueDate), projectType, hoursWorkedOn, songPage, notepadPage, projectStatus, completionDate, refid];

      const [data] = await dbconnection.execute(query, values);

      console.log(data);

      const postSuccess = true;

      return res.status(200).json({postSuccess});
    }

    else {
      return res.status(404).json({ error: 'Method not allowed' });
    }
  }

  catch (error) {
    return res.status(500).json({ error: 'server error!!!!!' });
  }
}

function parseMySQLDate(date){

  const inputDate = new Date(date);
  const adjustedDate = new Date(inputDate.getTime() - 5 * 60 * 60 * 1000);
  const mysqlDatetimeString = adjustedDate.toISOString().slice(0, 19).replace('T', ' ');

  return String(mysqlDatetimeString);
}

export const config = {
  api: {
    bodyParser: true,
  },
};