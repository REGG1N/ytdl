//tak uzywac = http://localhost:3000/ytdl?url=YT_LINK&key=
const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

app.use(express.static('public'));

const klucze = ["abcd"]; 

function sprawdzKlucz(req, res, next) {
    const apiKlucz = req.query.key;
    if (!apiKlucz || !klucze.includes(apiKlucz)) {
        return res.status(401).send('Brak dostępu');
    }
    next();
}

app.get('/ytdl', sprawdzKlucz, async (req, res) => {
    try {
        const url = req.query.url;
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).send('Nieprawidłowy link YouTube, tytuł piosenki nie moze zawierać emoji');
        }
        const info = await ytdl.getInfo(url);
        const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
        res.header('Content-Disposition', `attachment; filename="${sanitizeFilename(info.videoDetails.title)}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        const mp3Stream = ytdl(url, {
            format: 'mp3',
            quality: 'highestaudio',
            filter: 'audioonly',
        });
        mp3Stream.pipe(res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Coś poszło nie tak, tytuł piosenki nie moze zawierać emoji');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie: ${PORT}`);
});

function sanitizeFilename(filename) {
    return filename.replace(/[/\\?%*:|"<>]/g, '-');
}