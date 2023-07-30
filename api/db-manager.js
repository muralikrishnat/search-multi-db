import { MongoClient , ObjectId } from 'mongodb';
import configs from './configs.js';
import log from './utils/logger.js';

let db = null;

const  url = configs.MONGODB.HOST;
const client = new MongoClient(url);
const dbName = configs.MONGODB.BD_NAME;

var dbManager = {
    async init() {
        try {
            await client.connect();
            db = client.db(dbName);
            log({}, {}, 'MongoDB connected successfully');
            return { db };
        } catch(ex) {
            log({}, {}, 'MongoDB connection failed');
            return { error: ex };
        }
    },
    isConnected() {
        return db && db.client.topology.isConnected();
    },
    getDB() {
        return db;
    },
    ObjectId
};
export default dbManager;