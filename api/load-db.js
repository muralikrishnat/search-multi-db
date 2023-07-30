import { MongoClient , ObjectId } from 'mongodb';
import names from '../data/first-last-names.json' assert { type: 'json' };

console.log('names:  ', names.length);

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('searchdb');
let tableIndex = 1, tableCount = 5;
for(let i = 0; i < names.length; i++ ) {
    let record = names[i];
    let document = {
        _id: new ObjectId(),
        ...record
    };
    let insertResponce = await db.collection('table' + tableIndex).insertOne(document);
    console.log('inserted: ', insertResponce);
    if (tableIndex < tableCount) {
        tableIndex++;
    } else {
        tableIndex = 1;
    }
}
