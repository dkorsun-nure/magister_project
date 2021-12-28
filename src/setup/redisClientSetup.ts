import Redis from 'ioredis';

export default function (): Redis.Redis {
  const redis = new Redis();
  return redis;
}
