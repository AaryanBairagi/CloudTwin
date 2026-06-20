package service

import (
	"fmt"
	"cloudtwin-agent/internal/collector"
	"cloudtwin-agent/internal/publisher"
	"time"
)

func Run() {
	dockerCollector := collector.NewDockerCollector("/var/run/docker.sock")
	mqttPublisher , err := publisher.NewMQTTPublisher("tcp://localhost:1883", "cloudtwin/snapshots")
	if err != nil {
		panic(err)
	}

	ticker := time.NewTicker(10 * time.Second)
	
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