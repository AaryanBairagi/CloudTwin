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

async function enqueueCommand(twinId , command){
    await client.rPush(`commands : ${twinId}` , JSON.stringify(command));
}

async function dequeueCommand(twinId){
    const data = await client.lPop(`commands : ${twinId}`);
    if(!data) return null;
    return JSON.parse(data);
}


module.exports = { client , connectRedis , enqueueCommand , dequeueCommand }