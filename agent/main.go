package main

import (
	"fmt"
	"cloudtwin-agent/internal/collector"
)

func main() {
	fmt.Println("CloudTwin agent starting...")
	c:= collector.NewDockerCollector("/var/run/docker.sock")
	containers,err := c.ListContainers()
	
	if err != nil {
		panic(err)
	}

	for _, container := range containers {
		fmt.Printf(
			"Name: %s | State: %s\n",
			container.Names[0],
			container.State,
		)
	}
}



// aaryanbairagi@Aaryans-MacBook-Air ~ % curl --unix-socket /var/run/docker.sock http://localhost/containers/json
// [{"Id":"b40f35de8cbcd844954a936a87fe2d2392ef8b765567d9b30c9caf39602da868","Names":["/test-nginx"],"Image":"nginx","ImageID":"sha256:6415da96b72a2f6ff433053df1da4bd507e45bc44b2c83dbac0ddeea80c6f066","ImageManifestDescriptor":{"mediaType":"application/vnd.oci.image.manifest.v1+json","digest":"sha256:f4344ddc8c35561cff54381bcbdec9d5de67d10fe7ca32d0eb79d0de4249331e","size":2292,"annotations":{"com.docker.official-images.bashbrew.arch":"arm64v8","org.opencontainers.image.base.digest":"sha256:e9606f88b5f49b14d013d5c6d54ac7e11a48e13a6ec4c99d952330d03ddc703f","org.opencontainers.image.base.name":"debian:trixie-slim","org.opencontainers.image.created":"2026-06-17T22:32:12Z","org.opencontainers.image.revision":"00348041cc12284266751457dcfc10b15645476a","org.opencontainers.image.source":"https://github.com/nginx/docker-nginx.git#00348041cc12284266751457dcfc10b15645476a:mainline/debian","org.opencontainers.image.url":"https://hub.docker.com/_/nginx","org.opencontainers.image.version":"1.31.2"},"platform":{"architecture":"arm64","os":"linux","variant":"v8"}},"Command":"/docker-entrypoint.sh nginx -g 'daemon off;'","Created":1781798399,"Ports":[{"IP":"","PrivatePort":80,"Type":"tcp"}],"Labels":{"desktop.docker.io/ports.scheme":"v2","maintainer":"NGINX Docker Maintainers \u003cdocker-maint@nginx.com\u003e"},"State":"running","Status":"Up About a minute","HostConfig":{"NetworkMode":"bridge"},"Health":{"Status":"none","FailingStreak":0},"NetworkSettings":{"Networks":{"bridge":{"IPAMConfig":null,"Links":null,"Aliases":null,"DriverOpts":null,"GwPriority":0,"NetworkID":"cd3f9941bf822cc0a23f4866b9cae4adfcb607708c558d98d8a0cb5af79d8f69","EndpointID":"5980a1ccc902b928573bd664d06f83d55cd4f362a6fc0c8896599722430a8509","Gateway":"172.17.0.1","IPAddress":"172.17.0.2","MacAddress":"be:f0:d3:56:95:6d","IPPrefixLen":16,"IPv6Gateway":"","GlobalIPv6Address":"","GlobalIPv6PrefixLen":0,"DNSNames":null}}},"Mounts":[]}]%