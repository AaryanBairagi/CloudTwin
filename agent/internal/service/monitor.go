package service

import (
	"fmt"
	"cloudtwin-agent/internal/collector"
	"cloudtwin-agent/internal/publisher"
	"cloudtwin-agent/internal/config"
	"time"
)

func Run(config *config.Config) {
	dockerCollector := collector.NewDockerCollector(config.DockerSocket)
	mqttPublisher , err := publisher.NewMQTTPublisher(config.MQTTBroker, config.MQTTTopic)
	if err != nil {
		panic(err)
	}

	ticker := time.NewTicker(config.PollInterval * time.Second)
	
	defer ticker.Stop()

	for {
		containers , err := dockerCollector.ListContainers()

		if err != nil {
			fmt.Println("Error listing containers:", err)
			<-ticker.C
			continue
		}

		for _, container := range containers {
			stats , err := dockerCollector.GetStats(container.ID)

			if err != nil {
				fmt.Println("Error getting stats for container", container.ID, ":", err)
				continue
			}

			snapshot := collector.BuildSnapshot(container,stats)
			err = mqttPublisher.Publish(snapshot)

			if err != nil {
				fmt.Println("Error publishing snapshot:", err)
				continue
			}

		}

		<-ticker.C

	}
}