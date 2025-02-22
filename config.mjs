import 'dotenv/config';

const {
  PORT,
  JWT_SECRET,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  TZ,
  NODE_ENV,
} = process.env;

const production = NODE_ENV === 'production';

const config = {
  production,
  port: PORT,
  jwt: {
    secret: JWT_SECRET,
  },
  database: {
    host: DATABASE_HOST,
    database: DATABASE_NAME,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    timezone: TZ,
    connectionLimit: 5,
  },
  pagination: 10,
};

export default config;
