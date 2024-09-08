const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// CSV setup
const dataDir = path.join(__dirname, 'data');
const messagesFile = path.join(dataDir, 'messages.csv');

// Ensure the data directory exists
fs.ensureDirSync(dataDir);

// Create CSV file if it doesn't exist
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, 'id,content,timestamp\n');
}

// Function to get the next ID
async function getNextId() {
  return new Promise((resolve, reject) => {
    let maxId = 0;
    fs.createReadStream(messagesFile)
      .pipe(csv())
      .on('data', (row) => {
        const id = parseInt(row.id);
        if (id > maxId) maxId = id;
      })
      .on('end', () => resolve(maxId + 1))
      .on('error', reject);
  });
}

// Function to append a message to the CSV
async function appendMessage(message) {
  const id = await getNextId();
  const csvWriter = createCsvWriter({
    path: messagesFile,
    header: [
      {id: 'id', title: 'id'},
      {id: 'content', title: 'content'},
      {id: 'timestamp', title: 'timestamp'}
    ],
    append: true
  });
  
  return csvWriter.writeRecords([{
    id: id,
    content: message,
    timestamp: new Date().toISOString()
  }]).then(() => id);
}

// Serve static files from a 'public' directory
app.use(express.static('public'));

// API route to get all messages
app.get('/api/messages', (req, res) => {
  const messages = [];
  fs.createReadStream(messagesFile)
    .pipe(csv())
    .on('data', (row) => messages.push(row))
    .on('end', () => res.json(messages))
    .on('error', (err) => res.status(500).json({ error: 'Error reading messages' }));
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', async (data) => {
    try {
      const id = await appendMessage(data.text);
      console.log(`Message saved with ID: ${id}`);
      
      // Emit the message back to all clients
      io.emit('new_message', { id: id, text: data.text });
    } catch (err) {
      console.error('Error saving message', err);
      socket.emit('error', { message: 'Error saving message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
