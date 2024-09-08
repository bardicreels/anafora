const fs = require('fs');
const path = require('path');

app.get('/vtt-files', (req, res) => {
    const vttDir = path.join(__dirname, '..', 'vtt');
    fs.readdir(vttDir, (err, files) => {
        if (err) {
            console.error('Error reading VTT directory:', err);
            res.status(500).json({ error: 'Unable to read VTT files' });
        } else {
            const vttFiles = files.filter(file => path.extname(file).toLowerCase() === '.vtt');
            res.json(vttFiles);
        }
    });
});