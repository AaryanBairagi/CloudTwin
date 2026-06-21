const { Pool } = require('pg');

const pool = new Pool({
    host : process.env.PGHOST || 'localhost',
    port : Number(process.env.PGPORT || 5432),
    user : process.env.PGUSER || 'user',
    password : process.env.PGPASSWORD || "cloudtwin" ,
    database : process.env.PGDATABASE || "cloudtwin",
    max : 10
});

pool.on('error' , (err) => {
    console.log('[postgres] unexpected pool error : ' , error.msg);
});

async function query(text , params){
    return pool.query(text , params)
}

module.exports = { pool , query}