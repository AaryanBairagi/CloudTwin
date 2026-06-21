package main

import (
	"fmt"
	"cloudtwin-agent/internal/service"
	"cloudtwin-agent/internal/config"
)

func main() {
	fmt.Println("CloudTwin agent starting...")
	cfg := config.LoadConfig()
	
	fmt.Printf("Configuration loaded")
	service.Run(cfg)
}

