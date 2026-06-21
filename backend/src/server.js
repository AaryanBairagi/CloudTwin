const express = require('express');
const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://localhost:1883");

client.on('connect' ,() => {
    console.log("Connected to MQTT broker");
    client.subscribe('cloudtwin/snapshots');
});

client.on('message' , (topic , message) => {
    const snapshot = JSON.parse(message.toString());
    console.log("Received snapshot from :", snapshot.name);
});