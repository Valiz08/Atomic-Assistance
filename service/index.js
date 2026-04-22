require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const connectDB = require('./utils/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3088;

app.use(cors());
app.use(express.json());

// Hacer io accesible en los controllers vía req.app.get('io')
app.set('io', io);

// Rutas API
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
app.use('/api', userRoutes);
app.use('/api', recordRoutes);

// Servir frontend estático (build de React)
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// SPA fallback: todas las rutas no-API devuelven index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} unido a sala ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Conectar MongoDB y arrancar servidor
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
});
