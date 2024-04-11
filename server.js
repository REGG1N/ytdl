const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

app.use(express.static('public'));

const klucze = ["maKQafRFmw"]; 

function sprawdzKlucz(req, res, next) {
    const apiKlucz = req.query.key;
    if (!apiKlucz || !klucze.includes(apiKlucz)) {
        return res.status(401).send('Brak dostępu');
    }
    next();
}

app.get('/ytdl', sprawdzKlucz, async (req, res) => {
    try {
        const key = req.query.key; // Extract key first
        const url = req.query.url; // Then extract URL
        console.log('Requested URL:', url); // Log URL for debugging

        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).send('Nieprawidłowy link YouTube, tytuł piosenki nie może zawierać emoji');
        }
        const info = await ytdl.getInfo(url);
        if (!info) {
            return res.status(404).send('Wskazany film na YouTube nie istnieje lub został usunięty.');
        }

        const filename = 'paradisesong.mp3';

        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.header('Content-Type', 'audio/mpeg');

        const mp3Stream = ytdl(url, {
            format: 'mp3',
            quality: 'highestaudio',
            filter: 'audioonly',
        });
        mp3Stream.pipe(res);
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('Video unavailable') || error.message.includes('This video is unavailable')) {
            res.status(404).send('Wskazany film na YouTube nie istnieje lub został usunięty.');
        } else {
            res.status(500).send('Coś poszło nie tak, tytuł piosenki nie może zawierać emoji');
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie: ${PORT}`);
});

function sanitizeFilename(filename) {
    return filename.replace(/[^\w\s\-]/g, '-');
}
