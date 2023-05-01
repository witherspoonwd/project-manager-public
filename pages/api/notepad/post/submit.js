/* require('v8').setFlagsFromString('--harmony-top-level-await'); */

// file importz
import multer from 'multer';
import mysql from "mysql2/promise"

const upload = multer({
  limits: 1024 * 1024 * 100,
  storage: multer.diskStorage({
    destination: './public/notepad',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

function getDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const mysqlDateString = year + "-" + month + "-" + day;

  return mysqlDateString;
}

export default async function handler(req, res) {
  try {
    const dbconnection = await mysql.createConnection({
      host: process.env.SQL_HOST,
      database: process.env.SQL_DB,
      user: process.env.SQL_USR,
      password: process.env.SQL_PASS,
      socketPath: process.env.SQL_SOCK
    });

    if (req.method === 'POST'){

      let fileSuccess = false, postSuccess = false, editSuccess = "what";

      upload.single('file')(req, res, async function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        fileSuccess = true;

        const { title, content, editID } = req.body;
        const postDateTime = getDateTime();

        try {
          if (editID){
            const query = "UPDATE `private_notepad` SET `noteTitle` = ?, `htmlContent` = ? WHERE noteID= ?";
            let values = [title, content, editID];
    
            const [data] = await dbconnection.execute(query, values);

            editSuccess = true;
            postSuccess = "what";
          }

          else {
            const query = "INSERT INTO `private_notepad` (`noteTitle`, `htmlContent`, `dateCreated`) VALUES (?, ?, ?)";
            let values = [title, content, postDateTime];
    
            const [data] = await dbconnection.execute(query, values);

            postSuccess = true;
          }
        
        }
        catch(error){
          console.error(error);
          return res.status(500).json({ error: 'Server error' });
        }

        return res.status(200).json({fileSuccess, postSuccess, editSuccess});
      });
    }

    else {
      return res.status(404).json({ error: 'Method not allowed' });
    }
  }

  catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: 'Server error' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};