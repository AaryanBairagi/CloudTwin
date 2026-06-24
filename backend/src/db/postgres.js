require('dotenv').config();
const { Pool } = require('pg');

console.log({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE
});

const pool = new Pool({
    host : process.env.PGHOST || 'localhost',
    port : Number(process.env.PGPORT || 5432),
    user : process.env.PGUSER || 'user',
    password : process.env.PGPASSWORD || "cloudtwin" ,
    database : process.env.PGDATABASE || "cloudtwin",
    max : 10
});

pool.on('error' , (err) => {
    console.error('[postgres] unexpected pool error : ' , err.message);
});

async function query(text , params){
    return pool.query(text , params)
}

module.exports = { pool , query}