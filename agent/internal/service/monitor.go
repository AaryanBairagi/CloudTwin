package service

import (
	"fmt"
	"time"
	"cloudtwin-agent/internal/collector"
	"cloudtwin-agent/internal/commands"
	"cloudtwin-agent/internal/config"
	"cloudtwin-agent/internal/publisher"
)

func Run(config *config.Config) {

	dockerCollector := collector.NewDockerCollector(config.DockerSocket)

	mqttPublisher, err := publisher.NewMQTTPublisher(
		config.MQTTBroker,
		config.MQTTTopic,
	)
	if err != nil {
		panic(err)
	}

	poller := commands.NewPoller(config.BackendURL)

	go runMetricsLoop(
		dockerCollector,
		mqttPublisher,
		config,
	)

	go runCommandLoop(
		dockerCollector,
		poller,
		config,
	)

	select {}
}

func runMetricsLoop(
		dockerCollector *collector.DockerCollector,
		mqttPublisher *publisher.MQTTPublisher,
		config *config.Config,
	) {

	ticker := time.NewTicker(
		time.Duration(config.PollInterval) * time.Second,
	)

	defer ticker.Stop()

	for {

		containers, err := dockerCollector.ListContainers()

		if err != nil {
			fmt.Println("Error listing containers:", err)
			<-ticker.C
			continue
		}

		for _, container := range containers {

			stats, err := dockerCollector.GetStats(container.ID)

			if err != nil {
				fmt.Println(
					"Error getting stats for container",
					container.ID,
					":",
					err,
				)
				continue
			}

			snapshot := collector.BuildSnapshot(container, stats)

			err = mqttPublisher.Publish(snapshot)

			if err != nil {
				fmt.Println("Error publishing snapshot:", err)
			}

		}

		<-ticker.C

	}

}

func runCommandLoop(
		dockerCollector *collector.DockerCollector,
		poller *commands.Poller,
		config *config.Config,
	) {

	ticker := time.NewTicker(
		time.Duration(config.CommandPollInterval) * time.Second,
	)

	defer ticker.Stop()

	for {

		containers, err := dockerCollector.ListContainers()

		if err != nil {
			fmt.Println("Error listing containers:", err)
			<-ticker.C
			continue
		}

		for _, container := range containers {

			id := container.ID
			if len(id) > 12 {
				id = id[:12]
			}

			command, err := poller.Claim(id)

			if err != nil {
				fmt.Println("Error claiming command:", err)
				continue
			}

			if command == nil {
				continue
			}

			fmt.Printf(
				"[commands] Executing %s for %s\n",
				command.ActionType,
				container.Names[0],
			)

			var success bool

			switch command.ActionType {

			case "restart":
				err = dockerCollector.RestartContainer(command.TwinID)
				success = (err == nil)

			default:
				fmt.Println("Unknown command:", command.ActionType)
				success = false

			}

			if err != nil {
				fmt.Println("Command execution failed:", err)
			}

			err = poller.Ack(command.ID, success)

			if err != nil {
				fmt.Println("Failed to acknowledge command:", err)
			}

		}

		<-ticker.C

	}

}