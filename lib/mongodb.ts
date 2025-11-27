import mongoose from 'mongoose';

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable inside .env');
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Debug: Check what URL is being used
    const maskedUrl = MONGO_URL!.replace(/:([^:@]+)@/, ':****@');
    console.log('🔌 Connecting to MongoDB with URL:', maskedUrl);

    cached.promise = mongoose.connect(MONGO_URL!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MONGODB CONNECTION ERROR: Authentication failed or connection refused.");
    console.error("Please check your MONGO_URL in .env file. Ensure username, password, and database name are correct.");
    console.error("Raw Error:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
