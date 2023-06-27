import redis from 'redis';
import dotenv from 'dotenv'

dotenv.config()

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;