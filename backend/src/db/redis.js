const { createClient } = require("redis");

const client = createClient({ url : "redis://localhost:6379" });

client.on("error" , (err) => {
    console.error("Error connecting Redis : " , err);
});

async function connectRedis(){
    if(!client.isOpen){ 
        //if its already connected then dont reconnect or else connect
        await client.connect();
        console.log("[redis] connected");
    }
}

module.exports = { client , connectRedis }