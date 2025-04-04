interface Config {
  server: {
    port: number;
    host: string;
  };
  database: {
    useMongoose: boolean;
    uri: string;
    options: Record<string, any>;
  };
  auth: {
    enabled: boolean;
    jwtSecret: string;
    expiresIn: string;
  };
  storage: {
    type: string;
    filePath: string;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: 3000,
    host: 'localhost',
  },
  database: {
    useMongoose: true,
    uri: 'mongodb://localhost:27017/mydb',
    options: {},
  },
  auth: {
    enabled: true,
    jwtSecret: 'your-secret-key',
    expiresIn: '1h',
  },
  storage: {
    type: 'local',
    filePath: './uploads',
  },
  logging: {
    level: 'info',
  },
};

export default config;
