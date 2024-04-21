const fs = require('fs');
const pool = require('./db'); // Veritabanı bağlantısı için
const nodemailer = require('nodemailer'); // E-posta gönderme

require('dotenv').config();
const period = process.env.period;
console.log("preiyot:",period);
console.log("mail ",process.env.EMAIL_ADDRESS)

const controller = require('./controller');
const fetchAllStudents=controller.fetchAllStudents;
// // Öğrenci verilerini alma
// const fetchAllStudents = async () => {
//     try {
//         const result = await pool.query('SELECT * FROM Ogrenci');
//         return result.rows;
//     } catch (err) {
//         console.error('Hata:', err);
//         throw err;
//     }
// };
// E-posta ayarları
const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail kullanımı
    auth: {
        user: process.env.EMAIL_ADDRESS, // Gönderen e-posta adresi
        pass: process.env.EMAIL_PASS, // Gönderen e-posta uygulama şifresi
    },
});

// Yedekleme ve raporlama fonksiyonu
const generateBackup = async () => {
  // Tüm öğrencileri veritabanından al
  const students = await fetchAllStudents();

  // Öğrenci verilerini JSON formatına dönüştür
  const studentData = JSON.stringify(students, null, 2); // Daha güzel formatlama için 2 boşluk girintisi

  // Yedekleme dosyası adı ve formatı
  const backupFileName = `./yedeks/ogrenci-yedek2-${Date.now()}.json`;
  const backupFilePath = `./${backupFileName}`;

  // JSON dosyasını oluştur
  fs.writeFileSync(backupFilePath, studentData);

  // E-posta hazırlama
  const emailOptions = {
    from: 'cimen2001humeyra@gmail.com', // Gönderen e-posta adresi
    to: process.env.EMAIL_ADDRESS ,//  Alıcı e-posta adresi
    subject: `Haftalık Öğrenci Yedeği (${backupFileName})`,
    text: 'Herkese merhaba, bu e-posta ekte haftalık öğrenci yedek dosyasını içerir.',
    attachments: [
      {
        filename: backupFileName,
        path: backupFilePath,
      },
    ],
  };

  // E-posta gönder
  try {
    await transporter.sendMail(emailOptions);
    console.log('Haftalık rapor başarıyla gönderildi!');
  } catch (err) {
    console.error('Haftalık rapor gönderilirken hata oluştu:', err);
  } finally {
    // Yedek dosyasını sil (isteğe bağlı)
    // fs.unlinkSync(backupFilePath);
  }
};

// Her 1 dakikada bir yedekleme oluştur ve gönder
setInterval(generateBackup, 1000 * 60); // 1 dakika (milisecond cinsinden)

// Script'i ilk kez çalıştırmak için (ilk yedeklemeyi oluşturmak)
generateBackup();
