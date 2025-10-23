import dotenv from "dotenv";
import mongoose, { type ConnectOptions, type Connection } from "mongoose";

dotenv.config();

const DEFAULT_URI = "mongodb://127.0.0.1:27017/darna";

export const mongoUri = process.env.MONGODB_URI ?? DEFAULT_URI;

export class MongoDatabase {
  private static instance: MongoDatabase | null = null;

  private readonly uri: string;
  private readonly conn: Connection;

  private constructor(uri: string) {
    this.uri = uri;
    this.conn = mongoose.connection; // default connection
  }

  static getInstance(uri: string = mongoUri) {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase(uri);
    }
    return MongoDatabase.instance;
  }

  get readyState() {
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    return this.conn.readyState;
  }

  isConnected() {
    return this.readyState === 1;
  }

  async connect() {
    if (this.isConnected()) return this.conn;
    await mongoose.connect(this.uri);
    return this.conn;
  }

  async disconnect() {
    if (this.readyState === 0) return;
    await mongoose.disconnect();
  }
}

const db = MongoDatabase.getInstance();

export const connectToDatabase = async () => db.connect();
export const disconnectFromDatabase = async () => db.disconnect();
export const isDatabaseConnected = () => db.isConnected();