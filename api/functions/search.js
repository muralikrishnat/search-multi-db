import utils from '../utils/index.js';
import { ObjectId, MongoClient } from 'mongodb';
const { sendResponseWithHeaders } = utils;
export default {
    name: "search",
    async querydb(opts) {
        let {
            req,
            res,
            db
        } = opts;
        let searchPayload = req.body;
        let dbServerResp = await db.collection('dbservers').find({ _id: new ObjectId(searchPayload.dbId) }).toArray();
        if(dbServerResp.length === 0) {
            return res.end();
        }
        let dbServerToConnect = dbServerResp[0];
        if(dbServerToConnect.dbType === 'MONGODB') {
            let mongoClient = new MongoClient(dbServerToConnect.connectionString);
            await mongoClient.connect();
            const db = mongoClient.db(dbServerToConnect.dbName);
            let items = await db.collection(dbServerToConnect.tableName).find(
                searchPayload.find,
                searchPayload.options
            ).toArray();
            return sendResponseWithHeaders(req, res, {
                status: 200,
                data: items
            });
        }
        
        return res.end();
    }
}