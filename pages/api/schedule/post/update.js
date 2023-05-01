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

      const title = req.body.title;
      const content = req.body.content;
      const dueDate = req.body.duedate;
      const refid = req.body.refid;

      const query = "UPDATE `private_schedule` SET `title` = ?, `description` = ?, `dateDue` = ? WHERE itemID = ?";
      let values = [title, content, parseMySQLDate(dueDate), refid];

      const [data] = await dbconnection.execute(query, values);

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