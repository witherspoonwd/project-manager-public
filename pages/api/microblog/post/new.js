/* require('v8').setFlagsFromString('--harmony-top-level-await'); */

// file importz
import multer from 'multer';
import mysql from "mysql2/promise"

const upload = multer({
  limits: 1024 * 1024 * 10,
  storage: multer.diskStorage({
    destination: './public/microblog',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

function getDateTime() {
  // Create a new date object
  let date = new Date();

  // Get the hours, minutes, and seconds
  let hours = date.getHours();
  let minutes = date.getMinutes();

  // Check if it's AM or PM
  let amOrPm = hours >= 12 ? 'pm' : 'am';

  // Convert to 12 hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Add leading zeros to minutes if needed
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Get the month, day, and year
  let month = date.getMonth() + 1; // getMonth() returns 0-11 for Jan-Dec, so add 1 to get the correct month
  let day = date.getDate();
  let year = date.getFullYear().toString().substr(-2); // get last 2 digits of the year

  // Add leading zeros to month and day if needed
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;

  // Combine the date and time in the desired format
  let currentDateTime = `${month}.${day}.${year} ${hours}:${minutes}${amOrPm}`;

  return currentDateTime;
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

      let fileSuccess = false, postSuccess = false;

      upload.single('file')(req, res, async function (err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        fileSuccess = true;

        const { title, content, quoteTweetRef } = req.body;
        const postDateTime = getDateTime();

        try {
          const query = "INSERT INTO `microblog_posts` (`postTitle`, `postContent`, `postDateTime`, `quoteTweetRef`) VALUES (?, ?, ?, ?)";
          let values = [title, content, postDateTime, quoteTweetRef];

          if (quoteTweetRef === "null"){
            values[3] = null;
          }
  
          const [data] = await dbconnection.execute(query, values);

          postSuccess = true;
        
        }
        catch(error){
          console.error(error);
          return res.status(500).json({ error: 'Server error' });
        }

        return res.status(200).json({fileSuccess, postSuccess});
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