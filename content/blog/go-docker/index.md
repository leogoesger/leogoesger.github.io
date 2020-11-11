---
title: Go and Docker with Auto Reload
date: '2020-11-11T22:12:03.284Z'
status: 'draft'
tags: ["coding"]
---

![Docker and Go Image](./docker-go.png)
npm 

I find Docker for Mac to be a much simpler, higher performance option for running Linux containers on my Mac. Virtualbox is a pretty poor hypervisor and xhyve is much more efficient. You can have both Docker Toolbox and Docker for Mac installed on the same Mac and both will work, I just prefer Docker for Mac because it's really simple to use.

https://hub.docker.com/editions/community/docker-ce-desktop-mac/


Docker may ask your password for 

docker -v

https://hub.docker.com/_/golang?tab=tags

search for tags, for the latest

docker build -t my-go-app .

you can check the Docker Desktop Images, or VSCode extension images

Left is the port you want to listen in your machine,
docker run -p 8001:4000 -it my-go-app

-p 8080:8081 - This exposes our application which is running on port 8081 within our container on http://localhost:8080 on our local machine.
-it - This flag specifies that we want to run this image in interactive mode with a tty for this container process.
my-go-app - This is the name of the image that we want to run in a container.
use -d for detached mode

cannot go get in module

Reload

air

create .air.toml

-v is one to share file
docker run --rm -p 8001:4000 -v $(pwd):/app -d my-go-app 
