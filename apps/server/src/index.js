import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectToDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import savedRoutes from './routes/saved.js';
import communityRoutes from './routes/community.js';
import { configureSockets } from './sockets/index.js';
import { seedInitialData } from './seed/index.js';

dotenv.config();

const app = express();
app.use(cors({ origin: '*', credentials: false }));
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/community', communityRoutes);

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
configureSockets(io);

const PORT = process.env.PORT || 4000;

async function start() {
  await connectToDatabase(process.env.MONGO_URI || 'mongodb://localhost:27017');
  await seedInitialData();
  server.listen(PORT, () => {
    console.log(`Golden Library server listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
