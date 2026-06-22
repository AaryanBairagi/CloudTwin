const express = require('express');
const mqtt = require('mqtt');
const { upsertTwin , saveSnapshot } = require('./twin/twinEngine');

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