
// Haftalık raporlama
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// .env dosyasından periyot değişkenini okuma
require('dotenv').config();
const period = process.env.PERIOD;

// Periyot değişkenine göre haftalık yedekleme zamanları hesaplama
cron.schedule(`0 0 */${period} * *`, () => {
  pool.query('SELECT * FROM Ogrenci', (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      // JSON formatında bir dosyaya yazma
      const fs = require('fs');
      fs.writeFileSync('backup.json', JSON.stringify(res.rows));

      // E-posta gönderimi
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'youremail@gmail.com',
          pass: 'yourpassword'
        }
      });

      let mailOptions = {
        from: 'youremail@gmail.com',
        to: 'recipientemail@gmail.com',
        subject: 'Weekly Database Backup',
        text: 'Attached is the weekly backup of the database.',
        attachments: [
          {
            path: 'backup.json'
          }
        ]
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  });
});
