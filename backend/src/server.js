const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const { upsertTwin , saveSnapshot } = require('./twin/twinEngine');
const { createAlert } = require('./rules/alertManager');
const { evaluateRule, getEnabledRules } = require('./rules/ruleEvaluator');

//EXPRESS ROUTER - ROUTES
const twinsRoute = require('./routes/twins');
const alertRoutes = require('./routes/alerts');
const actionRoutes = require('./routes/actions');

const app = express();
const port = 4000;


//MIDDLEWARE
app.use(cors({
   origin : 'http://localhost:3000'
}));

app.use('/twins' , twinsRoute);
app.use('/alerts' , alertRoutes);
app.use('/actions' , actionRoutes);

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

        const rules = await getEnabledRules();
        for(const rule of rules){
            const matched = evaluateRule(snapshot,rule);

            if(matched){
                await createAlert(snapshot,rule);
                console.log(
                    `Alert created for ${snapshot.name} (${rule.metric} ${rule.operator} ${rule.threshold})`
                );
            }
        }

        console.log("Stored snapshot for:", snapshot.name);
    } catch(err) {
        console.error("Failed to process snapshot:", err.message);
    }
});