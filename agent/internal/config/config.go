package config

type Config struct {
	DockerSocket string
	MQTTBroker string
	MQTTTopic string
	PollInterval int
}

func LoadConfig() *Config {
	return &Config{
		DockerSocket : "/var/run/docker.sock",
		MQTTBroker : "tcp://localhost:1883",
		MQTTTopic : "cloudtwin/snapshots",
		PollInterval : 10,
	}
}