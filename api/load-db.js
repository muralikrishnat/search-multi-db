import { MongoClient, ObjectId } from 'mongodb';
import pg from 'pg';
import names from '../data/first-last-names.json' assert { type: 'json' };



const client = new MongoClient('mongodb://root:password@localhost:27017');
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
    if (tableIndex < tableCount) {
        tableIndex++;
    } else {
        tableIndex = 1;
    }
}


const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'multisearchdb',
    password: 'password',
    port: 5432,
});

 
const insertRecordsInPg = async (tableName, recordToInsert) => {
    //insert recordToInsert into table in pgclient in table in pgclient
    return await pool.query(`
        INSERT INTO table1(firstname, lastname, email, gender, location) 
        VALUES($1, $2, $3, $4, $5);
    `, [recordToInsert.first_name, recordToInsert.last_name, recordToInsert.email, recordToInsert.gender, recordToInsert.location]);
}

// await insertRecordsInPg();
const availableTablesInPg = ['table1', 'table2', 'table3'];
const insertRecords = async () => {
    console.log('starting');
    let tableIndex = 1, tableCount = 3;
    for await(let record of names) {
        await insertRecordsInPg(availableTablesInPg[tableIndex - 1], record);
        if (tableIndex < tableCount) {
            tableIndex++;
        } else {
            tableIndex = 1;
        }
    }
    console.log('done');
}

//await insertRecords();
