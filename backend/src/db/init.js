const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs')
const path = require('path')
const { pool } = require("./postgres");

async function init(){
    const filePath = path.join(__dirname , 'schema.sql')
    const sql = fs.readFileSync(filePath , "utf-8")

    await pool.query(sql);
    console.log("[db] schema applied");
    await pool.end();
}

init().catch((err) => {
    console.error("[db] failed to apply schema : " , err);
    process.exit(1);
})