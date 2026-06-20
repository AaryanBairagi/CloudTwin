package main

import (
	"fmt"
	"cloudtwin-agent/internal/service"
)

func main() {
	fmt.Println("CloudTwin agent starting...")
	service.Run()
}

