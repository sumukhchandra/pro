import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './src/routes/api.js';
import contentRoutes from './src/routes/content.js';
import chaptersRoutes from './src/routes/chapters.js';
import adsRoutes from './src/routes/ads.js';
import authRoutes from './src/routes/auth.js';
import relationshipsRoutes from './src/routes/relationships.js';
import calendarRoutes from './src/routes/calendar.js';
import diaryRoutes from './src/routes/diary.js';
import chatRoutes from './src/routes/chat.js';
import gamesRoutes from './src/routes/games.js';
import mediaRoutes from './src/routes/media.js';
import connectDB from './src/config/db.js';
import signaling from './src/realtime/signaling.js';
import realtimeService from './src/services/realtimeService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// static uploads directory for media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
connectDB();

// Routes

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

// Initialize realtime signaling and get helpers
const realtimeHelpers = signaling(io);

// Initialize realtime service
realtimeService.initialize(io, realtimeHelpers);

// Make realtime helpers and service available globally
global.realtimeHelpers = realtimeHelpers;
global.realtimeService = realtimeService;

// Make db available to routes


app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/ads', adsRoutes);
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
