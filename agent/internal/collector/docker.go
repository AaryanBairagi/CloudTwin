package collector

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"time"
	"strings"
)


type Container struct {
	ID    string   `json:"Id"`
	Names []string `json:"Names"`
	State string   `json:"State"`
}


type DockerCollector struct {
	socketPath string
	client     *http.Client
}


type CPUUsage struct {
	TotalUsage uint64 `json:"total_usage"`
}


type CPUStats struct {
	CPUUsage    CPUUsage `json:"cpu_usage"`
	SystemUsage uint64   `json:"system_cpu_usage"`
	OnlineCPUs  uint32   `json:"online_cpus"`
}


type MemoryStats struct {
	Usage uint64 `json:"usage"`
	Limit uint64 `json:"limit"`
}


type Stats struct {
	Name        string      `json:"name"`
	CPUStats    CPUStats    `json:"cpu_stats"`
	PreCPUStats CPUStats    `json:"precpu_stats"`
	MemoryStats MemoryStats `json:"memory_stats"`
}


type Snapshot struct {
	ContainerID string `json:"containerId"`
	Name string `json:"name"`
	State string `json:"state"`
	CPUPercent float64 `json:"cpuPercent"`
	MemoryMB float64 `json:"memoryMB"`
	MemoryLimitMB float64 `json:"memoryLimitMB"`
	MemoryPercent float64 `json:"memoryPercent"`
	Timestamp string `json:"timestamp"`
}


func NewDockerCollector(socketPath string) *DockerCollector {
	client := &http.Client{
		Transport: &http.Transport{
			DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
				return net.Dial("unix", socketPath)
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


func (d *DockerCollector) GetStats(containerID string) (*Stats, error) {
	url := fmt.Sprintf("http://unix/containers/%s/stats?stream=false", containerID)
	resp, err := d.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() //means close the response body when the function returns/exists

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var stats Stats
	err = json.Unmarshal(body, &stats)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

//in GO lowercase first letter of functon name means its a private function nad uppercase means its public function


func CalculateCPUPercent(stats *Stats) float64 {
	cpuDelta := float64(stats.CPUStats.CPUUsage.TotalUsage) - float64(stats.PreCPUStats.CPUUsage.TotalUsage)
	systemDelta := float64(stats.CPUStats.SystemUsage) - float64(stats.PreCPUStats.SystemUsage)
	onlineCPUs := float64(stats.CPUStats.OnlineCPUs)

	if cpuDelta <= 0 || systemDelta <= 0 {
		return 0
	}

	return (cpuDelta / systemDelta) * 100 * onlineCPUs
}


func round2(value float64) float64 {
	return float64( int(value*100+0.5) ) / 100
}


func BuildSnapshot(container Container, stats *Stats) Snapshot {
	id := container.ID
	if(len(id) > 12){
		id = id[:12]
	}

	memMB := float64(stats.MemoryStats.Usage) / (1024 * 1024)
	memLimitMB := float64(stats.MemoryStats.Limit) / (1024 * 1024)
	memPercent := (memMB / memLimitMB) * 100
	cpuPercent := CalculateCPUPercent(stats)
	timestamp := time.Now().UTC().Format(time.RFC3339)
	name := strings.TrimPrefix(container.Names[0], "/")

	return Snapshot{
		ContainerID :  id,
		Name:          name,
		State:         container.State,
		CPUPercent:    round2(cpuPercent),
		MemoryMB:      round2(memMB),
		MemoryLimitMB: round2(memLimitMB),
		MemoryPercent: round2(memPercent),
		Timestamp:     timestamp,
	}

}
