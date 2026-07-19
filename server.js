const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());

const upload = multer({
    dest: '/tmp/',
    limits: { fileSize: 25 * 1024 * 1024 }
});

app.post('/convert', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada berkas yang diunggah.' });
    }

    const inputPath = req.file.path;
    const outputDir = '/tmp';
    const outputFilePath = path.join(outputDir, `${req.file.filename}.pdf`);

    exec(`libreoffice --headless --convert-to pdf ${inputPath} --outdir ${outputDir}`, (error, stdout, stderr) => {
        if (error) {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(500).json({ error: 'Gagal melakukan konversi dokumen.' });
        }

        if (!fs.existsSync(outputFilePath)) {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(500).json({ error: 'Output PDF tidak ditemukan.' });
        }

        res.download(outputFilePath, 'converted.pdf', (err) => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Backend server berjalan di port ${PORT}`);
});
