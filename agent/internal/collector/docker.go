package collector

import (
	"context"
	"io"
	"encoding/json"
	"net"
	"net/http"
)

type Container struct{
	ID 		string		`json:"Id"`
	Names 	[]string	`json:"Names"`
	State 	string		`json:"State"`
}

type DockerCollector struct{
	socketPath string
	client *http.Client
}

func NewDockerCollector(socketPath string) *DockerCollector {
	client := &http.Client{
		Transport : &http.Transport{
			DialContext : func(ctx context.Context, _, _ string) (net.Conn, error) {
				return net.Dial("unix",socketPath)
			},
		},
	}
	return &DockerCollector{
		socketPath: socketPath,
		client:     client,
	}
}

func (d *DockerCollector) ListContainers() ([]Container, error) {

	resp, err := d.client.Get("http://unix/containers/json")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var containers []Container

	err = json.Unmarshal(body, &containers)
	if err != nil {
		return nil, err
	}

	return containers, nil
}

