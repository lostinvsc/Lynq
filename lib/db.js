import mysql from 'mysql2/promise';
import { parse } from 'url';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const { hostname, port, pathname, auth } = parse(dbUrl);
const [user, password] = auth.split(':');
const database = pathname.slice(1);

const pool = mysql.createPool({
  host: hostname,
  user,
  password,
  database,
  port: port ? parseInt(port) : 4000,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: true,
  },
});

export default pool;
