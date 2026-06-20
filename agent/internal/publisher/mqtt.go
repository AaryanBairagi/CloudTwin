package publisher

import (
	"fmt"
	"encoding/json"
	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type MQTTPublisher struct {
	client mqtt.Client
	topic  string
}

func NewMQTTPublisher(broker string , topic string) (*MQTTPublisher, error) {
	opts := mqtt.NewClientOptions().AddBroker(broker)

	client := mqtt.NewClient(opts)
	token := client.Connect()
	token.Wait()

	if token.Error() != nil {
		return nil , token.Error()
	}

	fmt.Println("Connected to MQTT broker at : ", broker)

	return &MQTTPublisher{
		client : client,
		topic : topic,
	}, nil
}

func (m *MQTTPublisher) Publish(snapshot any) error{
	payload , err := json.Marshal(snapshot)
	
	if err != nil {
		return err
	}

	token := m.client.Publish(m.topic , 0 , false , payload)
	token.Wait()
	
	return token.Error()
}	