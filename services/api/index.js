import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import apiRoutes from './src/routes/api.js';
import authRoutes from './src/routes/auth.js';
import relationshipsRoutes from './src/routes/relationships.js';
import calendarRoutes from './src/routes/calendar.js';
import diaryRoutes from './src/routes/diary.js';
import chatRoutes from './src/routes/chat.js';
import gamesRoutes from './src/routes/games.js';
import mediaRoutes from './src/routes/media.js';
import connectDB from './src/config/db.js';
import signaling from './src/realtime/signaling.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to database
connectDB();

// Routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

signaling(io);

// Make db available to routes


app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/media', mediaRoutes);


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
