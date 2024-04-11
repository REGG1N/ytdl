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
        const url = req.query.url;
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).send('Nieprawidłowy link YouTube, tytuł piosenki nie może zawierać emoji');
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
        if (error instanceof ytdl.MinigetError && error.statusCode === 410) {
            res.status(404).send('Żądany film nie jest dostępny.');
        } else {
            console.error('Błąd:', error);
            res.status(500).send('Wystąpił błąd podczas przetwarzania żądania.');
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie: ${PORT}`);
});

function sanitizeFilename(filename) {
    return filename.replace(/[/\\?%*:|"<>]/g, '-');
}
