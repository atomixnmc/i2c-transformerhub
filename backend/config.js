module.exports = {
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  database: {
    useMongoose: process.env.USE_MONGODB === 'true',
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/transformerhub',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  auth: {
    enabled: process.env.AUTH_ENABLED === 'true',
    jwtSecret: process.env.JWT_SECRET || 'transformerhub-secret-key',
    expiresIn: '24h'
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'memory', // 'memory', 'mongodb', 'file'
    filePath: process.env.STORAGE_FILE_PATH || './data'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};
