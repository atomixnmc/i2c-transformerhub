import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import flowsRouter from './routes/flows';
import nodeTypesRouter from './routes/nodeTypes';

// Import configuration
import config from './config';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/flows', flowsRouter);
app.use('/api/node-types', nodeTypesRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Connect to MongoDB if configured
if (config.database.useMongoose) {
  mongoose.connect(config.database.uri, config.database.options)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Using in-memory storage instead');
    });
}

// Start the server
const PORT = process.env.PORT || config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
