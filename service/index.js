require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
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

// Rutas
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
app.use('/api', userRoutes);
app.use('/api', recordRoutes);

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
