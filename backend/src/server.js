const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const { upsertTwin , saveSnapshot } = require('./twin/twinEngine');
const twinsRoute = require('./routes/twins');

const app = express();
const port = 4000;

app.use(cors({
   origin : 'http://localhost:3000'
}));

app.use('/twins' , twinsRoute);

app.listen(port, () => {
    console.log(`App running at port ${port}`)
});

const client = mqtt.connect("mqtt://localhost:1883");

client.on('connect' ,() => {
    console.log("Connected to MQTT broker");
    client.subscribe('cloudtwin/snapshots');
});

client.on('message', async (topic, message) => {
    try {
        const snapshot = JSON.parse(message.toString());
        await upsertTwin(snapshot);
        await saveSnapshot(snapshot);

        console.log("Stored snapshot for:", snapshot.name);
    } catch(err) {
        console.error("Failed to process snapshot:", err.message);
    }
});