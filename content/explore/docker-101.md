---
title: "🐳 Complete Docker Guide: From Basic to Advanced"
date: 2026-03-22T22:38:20+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
hiddenInHomeList: false
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

**A Comprehensive, Self-Learning Docker Resource**

---

## 📑 Table of Contents

### **PART 1: FOUNDATIONS**

1. [Introduction to Docker](#1-introduction-to-docker)
2. [Core Concepts](#2-core-concepts)
3. [Installation & Setup](#3-installation--setup)
4. [Your First Container](#4-your-first-container)

### **PART 2: WORKING WITH CONTAINERS**

5. [Container Lifecycle](#5-container-lifecycle)
6. [Container Management](#6-container-management)
7. [Port Mapping & Networking](#7-port-mapping--networking)
8. [Container Logs & Debugging](#8-container-logs--debugging)

### **PART 3: CREATING IMAGES**

9. [Understanding Dockerfiles](#9-understanding-dockerfiles)
10. [Building Custom Images](#10-building-custom-images)
11. [Dockerfile Best Practices](#11-dockerfile-best-practices)
12. [Multi-Stage Builds](#12-multi-stage-builds)

### **PART 4: DATA PERSISTENCE**

13. [Understanding Container Data](#13-understanding-container-data)
14. [Volumes](#14-volumes)
15. [Bind Mounts](#15-bind-mounts)
16. [Volume Management](#16-volume-management)

### **PART 5: DOCKER COMPOSE**

17. [Introduction to Docker Compose](#17-introduction-to-docker-compose)
18. [Docker Compose Syntax](#18-docker-compose-syntax)
19. [Multi-Container Applications](#19-multi-container-applications)
20. [Environment Variables & Secrets](#20-environment-variables--secrets)

### **PART 6: NETWORKING**

21. [Docker Networks Deep Dive](#21-docker-networks-deep-dive)
22. [Network Types](#22-network-types)
23. [Container Communication](#23-container-communication)
24. [Custom Networks](#24-custom-networks)

### **PART 7: ADVANCED TOPICS**

25. [Resource Management](#25-resource-management)
26. [Health Checks](#26-health-checks)
27. [Security Best Practices](#27-security-best-practices)
28. [Docker Registry & Hub](#28-docker-registry--hub)
29. [Optimization Techniques](#29-optimization-techniques)

### **PART 8: REAL-WORLD PROJECTS**

30. [Project 1: Simple Web Application](#30-project-1-simple-web-application)
31. [Project 2: Full-Stack MERN App](#31-project-2-full-stack-mern-app)
32. [Project 3: Microservices Architecture](#32-project-3-microservices-architecture)
33. [Project 4: Development Environment](#33-project-4-development-environment)

### **APPENDICES**

- [Complete Command Reference](#complete-command-reference)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Common Patterns & Solutions](#common-patterns--solutions)
- [Glossary](#glossary)

---

# PART 1: FOUNDATIONS

---

## 1. Introduction to Docker

### 1.1 What is Docker?

**Simple Definition:**
Docker is a platform that packages applications and their dependencies into containers - portable, isolated environments that run consistently across any computer.

**The Problem Docker Solves:**

Imagine you build an application on your laptop:

- Uses Python 3.9
- Needs PostgreSQL 13
- Requires specific libraries
- Works perfectly on your machine ✅

You send it to a teammate:

- They have Python 3.7 (different version!)
- PostgreSQL 14 installed
- Different operating system
- Your code crashes ❌

**This is the infamous "It works on my machine" problem.**

### 1.2 How Docker Solves This

Docker packages your application with EVERYTHING it needs:

- Specific Python version
- Database
- Libraries
- Configuration files
- Operating system dependencies

All bundled into a **container** that runs the same way everywhere.

### 1.3 Real-World Analogy

**Without Docker:**
Your code is like furniture. Everyone has different homes (computers) with different layouts. Your furniture might not fit in someone else's home.

**With Docker:**
Docker creates a portable, pre-built room that contains your furniture AND the exact environment it needs. You can place this room in ANY building (computer), and it works exactly the same.

### 1.4 Docker vs Virtual Machines

**Virtual Machine (VM):**

```
Your Computer
└── Hypervisor
    └── Guest OS (entire operating system - 2GB+)
        └── Application

Startup: Minutes
Size: Gigabytes
Resources: Heavy
```

**Docker Container:**

```
Your Computer
└── Docker Engine
    └── Container (app + dependencies only - MBs)

Startup: Seconds
Size: Megabytes
Resources: Lightweight
```

**Key Difference:**

- VMs include entire operating system (slow, heavy)
- Containers share the host OS kernel (fast, lightweight)

### 1.5 When to Use Docker

**✅ Perfect For:**

- Development environments (everyone has same setup)
- Testing different software versions
- Microservices architecture
- CI/CD pipelines
- Running databases locally without installation
- Deploying applications
- Isolating applications from each other

**❌ Not Ideal For:**

- Desktop GUI applications (though possible)
- Applications requiring direct hardware access
- Simple static websites (overkill)
- When you're just running a single script once

### 1.6 Key Benefits

1. **Consistency:** Works the same on dev, test, and production
2. **Isolation:** Applications don't interfere with each other
3. **Portability:** Run anywhere Docker is installed
4. **Speed:** Start/stop in seconds
5. **Efficiency:** Multiple containers on one machine
6. **Clean System:** Delete container = everything gone
7. **Version Control:** Different versions side-by-side

---

## 2. Core Concepts

### 2.1 The Three Main Components

#### **Image (Blueprint/Recipe)**

**What it is:**

- A read-only template with instructions
- Contains application code, runtime, libraries, dependencies
- Can be shared and reused
- Stored in registries (like Docker Hub)

**Analogy:** A recipe for chocolate cake

**Example:** `nginx:latest`, `python:3.11`, `mongo:6.0`

#### **Container (Running Instance)**

**What it is:**

- A runnable instance of an image
- Isolated environment where your app runs
- Can be started, stopped, deleted
- Changes are lost when deleted (unless using volumes)

**Analogy:** The actual cake baked from the recipe

**Important:** You can create multiple containers from one image!

#### **Registry (Recipe Library)**

**What it is:**

- Storage and distribution system for images
- Docker Hub is the default public registry
- Can be private or public

**Analogy:** A cookbook library

**Example:** hub.docker.com

### 2.2 The Relationship

```
Registry (Docker Hub)
    ↓
  [Image] ← You download this (docker pull)
    ↓
    ↓ (docker run)
    ↓
[Container 1]  [Container 2]  [Container 3]
 Running        Running         Stopped
```

**Real Example:**

```
Docker Hub
    ↓
nginx:latest (image)
    ↓
    ↓ docker run
    ↓
[Website A]  [Website B]  [Website C]
All separate containers from the same image!
```

### 2.3 Image Layers

**Images are built in layers (like a cake with multiple layers):**

```
Layer 4: Your application code        ← Your files
Layer 3: Application dependencies     ← npm install, pip install
Layer 2: Runtime environment           ← Node.js, Python
Layer 1: Base operating system         ← Ubuntu, Alpine
```

**Why layers matter:**

- Efficient storage (shared layers)
- Faster builds (cached layers)
- Smaller downloads (only new layers)

**Example:**
If you build two images both using Ubuntu:

- Ubuntu is downloaded once
- Both images share that layer
- Only differences are stored separately

### 2.4 Container Isolation

**Each container has its own:**

- File system (can't see other containers' files)
- Network interface (own IP address)
- Process tree (own running processes)
- Resources (allocated CPU/memory)

**Think of it like:** Separate apartments in a building. Each is independent, but they share the building's infrastructure.

### 2.5 Mental Model Summary

**Remember this:**

```
Dockerfile (Instructions)
    ↓
docker build
    ↓
Image (Template)
    ↓
docker run
    ↓
Container (Running app)
```

**Or with cooking analogy:**

```
Recipe Card
    ↓
Following the recipe
    ↓
Cake Mix (prepared)
    ↓
Baking
    ↓
Actual Cake (ready to eat)
```

---

## 3. Installation & Setup

### 3.1 Installing Docker

#### **Linux (Ubuntu/Debian)**

```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
sudo docker run hello-world
```

#### **Post-Installation (Linux)**

**Run Docker without sudo:**

```bash
# Create docker group
sudo groupadd docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Test without sudo
docker run hello-world
```

#### **macOS**

1. Download Docker Desktop from docker.com
2. Install the .dmg file
3. Start Docker Desktop
4. Verify: `docker --version`

#### **Windows**

1. Enable WSL 2 (Windows Subsystem for Linux)
2. Download Docker Desktop from docker.com
3. Install and restart
4. Verify in PowerShell: `docker --version`

### 3.2 Verify Installation

```bash
# Check Docker version
docker --version
# Should show: Docker version 24.x.x

# Check Docker is running
docker info

# Run test container
docker run hello-world
# Should download and run successfully
```

### 3.3 Understanding Docker Architecture

**When you run Docker commands, here's what happens:**

```
Your Terminal
    ↓
Docker CLI (docker command)
    ↓
Docker Daemon (dockerd - background service)
    ↓
Container Runtime (containerd)
    ↓
Containers
```

**Docker Daemon:**

- Background service that manages images and containers
- Must be running for Docker to work
- Check status: `sudo systemctl status docker` (Linux)

### 3.4 Configuration Files

**Linux:**

- Docker daemon config: `/etc/docker/daemon.json`
- User config: `~/.docker/config.json`

**macOS/Windows:**

- Settings accessible through Docker Desktop GUI

### 3.5 Initial Setup Best Practices

**1. Configure logging:**

Create/edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker: `sudo systemctl restart docker`

**2. Set data directory (if needed):**

```json
{
  "data-root": "/path/to/your/docker/data"
}
```

---

## 4. Your First Container

### 4.1 Hello World

**Run your first container:**

```bash
docker run hello-world
```

**What happens step by step:**

1. **Docker checks locally:** "Do I have 'hello-world' image?"
2. **Not found:** "Let me download from Docker Hub"
3. **Downloads image:** Pulls from registry
4. **Creates container:** From the image
5. **Runs container:** Executes its code
6. **Prints message:** Shows output
7. **Exits:** Container stops (job done)

**Read the output carefully!** It explains what just happened.

### 4.2 Running a Web Server

**Let's run something more useful - nginx web server:**

```bash
docker run -d -p 8080:80 nginx
```

**Breaking down the command:**

- `docker run` - Create and start a container
- `-d` - Detached mode (run in background)
- `-p 8080:80` - Port mapping (your port 8080 → container port 80)
- `nginx` - Image name

**Test it:**
Open browser: `http://localhost:8080`

You should see "Welcome to nginx!"

**What just happened:**

- Downloaded nginx image
- Started nginx web server in a container
- Made it accessible on your computer's port 8080

### 4.3 Viewing Running Containers

```bash
docker ps
```

**Output explanation:**

```
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS                  NAMES
a1b2c3d4e5f6   nginx   ...       1 min     Up       0.0.0.0:8080->80/tcp   confident_shaw
```

**Columns:**

- **CONTAINER ID:** Unique identifier (use first 3-4 chars in commands)
- **IMAGE:** Which image this container uses
- **COMMAND:** Command running inside container
- **CREATED:** When container was created
- **STATUS:** Current state (Up = running)
- **PORTS:** Port mappings
- **NAMES:** Auto-generated name (or custom if you set one)

### 4.4 Stopping a Container

```bash
# Stop by ID (use first few characters)
docker stop a1b2

# Or stop by name
docker stop confident_shaw

# Verify it stopped
docker ps  # Won't show (it's stopped)
docker ps -a  # Shows all containers including stopped
```

### 4.5 Starting a Stopped Container

```bash
docker start a1b2

# Verify it's running
docker ps
```

**Browser should work again!**

### 4.6 Removing a Container

```bash
# Must be stopped first
docker stop a1b2

# Remove it
docker rm a1b2

# Or force remove (even if running)
docker rm -f a1b2

# Verify it's gone
docker ps -a
```

### 4.7 Auto-Remove Containers

**Use `--rm` flag to auto-delete when stopped:**

```bash
docker run --rm -d -p 8080:80 nginx

# When you stop it, it's automatically removed
docker stop <container_id>
docker ps -a  # Won't show - it's gone!
```

**Useful for:** Temporary containers, testing

### 4.8 Naming Containers

**Give containers meaningful names:**

```bash
docker run -d --name my_webserver -p 8080:80 nginx
```

**Now you can use the name:**

```bash
docker stop my_webserver
docker start my_webserver
docker logs my_webserver
docker rm my_webserver
```

**Much easier than remembering IDs!**

### 4.9 Common First Container Mistakes

**❌ Mistake 1: Port already in use**

```bash
docker run -d -p 8080:80 nginx
docker run -d -p 8080:80 nginx  # ERROR!
```

**Solution:** Use different host port: `-p 8081:80`

**❌ Mistake 2: Trying to remove running container**

```bash
docker rm <container_id>  # ERROR if running
```

**Solution:** Stop first, or use `-f`: `docker rm -f <container_id>`

**❌ Mistake 3: Forgetting port mapping**

```bash
docker run -d nginx  # No -p flag
```

**Problem:** Can't access from browser (no port exposed)
**Solution:** Always use `-p` for web services

### 4.10 Quick Practice Exercise

**Task:** Run three different nginx containers on different ports

```bash
# Container 1 on port 8081
docker run -d --name web1 -p 8081:80 nginx

# Container 2 on port 8082
docker run -d --name web2 -p 8082:80 nginx

# Container 3 on port 8083
docker run -d --name web3 -p 8083:80 nginx

# Verify all running
docker ps

# Test in browser:
# http://localhost:8081
# http://localhost:8082
# http://localhost:8083

# Clean up
docker stop web1 web2 web3
docker rm web1 web2 web3
```

### 4.11 Cheat Sheet: First Commands

```bash
# Run container
docker run <image>                    # Basic run
docker run -d <image>                 # Background mode
docker run -p 8080:80 <image>         # With port mapping
docker run --name myapp <image>       # With custom name
docker run --rm <image>               # Auto-remove when stopped

# List containers
docker ps                             # Running containers
docker ps -a                          # All containers
docker ps -q                          # Only IDs

# Control containers
docker stop <id/name>                 # Stop container
docker start <id/name>                # Start stopped container
docker restart <id/name>              # Restart container
docker rm <id/name>                   # Remove stopped container
docker rm -f <id/name>                # Force remove (even if running)

# Get information
docker logs <id/name>                 # View container logs
docker inspect <id/name>              # Detailed info
```

---

# PART 2: WORKING WITH CONTAINERS

---

## 5. Container Lifecycle

### 5.1 Understanding Container States

**A container can be in one of these states:**

```
Created → Running → Paused → Stopped → Deleted
   ↑         ↓                   ↑
   └─────────┴───────────────────┘
         (can be restarted)
```

**Visual representation:**

```
docker run          → Created + Running
docker pause        → Paused
docker unpause      → Running again
docker stop         → Stopped (gracefully)
docker kill         → Stopped (forcefully)
docker start        → Running again
docker restart      → Stopped + Running
docker rm           → Deleted (gone forever)
```

### 5.2 Creating vs Running

**Important distinction:**

**`docker create`** - Creates container but doesn't start it

```bash
docker create --name myapp nginx
# Container exists but not running
```

**`docker run`** - Creates AND starts container

```bash
docker run --name myapp nginx
# Equivalent to: docker create + docker start
```

**When to use `create`:** Rarely. Usually just use `run`.

### 5.3 Stop vs Kill

**`docker stop` (Graceful shutdown):**

```bash
docker stop myapp
```

- Sends SIGTERM signal (polite request to stop)
- Waits 10 seconds for cleanup
- If still running, sends SIGKILL (force stop)
- **Use this normally**

**`docker kill` (Force stop):**

```bash
docker kill myapp
```

- Immediately sends SIGKILL (no cleanup time)
- **Use only when stop doesn't work**

**Example scenario:**

```bash
# Web server handling requests
docker stop webserver
# Server finishes current requests, then stops ✅

docker kill webserver
# Server stops immediately, requests may fail ❌
```

### 5.4 Pause vs Stop

**`docker pause`** - Freezes container (keeps in memory)

```bash
docker pause myapp
# All processes frozen, but container still "running"
# Uses RAM but no CPU
```

**`docker unpause`** - Resumes frozen container

```bash
docker unpause myapp
# Continues exactly where it left off
```

**When to use:** Very specific scenarios (debugging, system snapshots)

**`docker stop`** - Actually stops the container

```bash
docker stop myapp
# Container stopped, can be started later
# State saved, but processes terminated
```

### 5.5 Restart Policies

**Tell Docker what to do when container stops:**

```bash
# Never restart (default)
docker run -d --restart no nginx

# Always restart (even after reboot)
docker run -d --restart always nginx

# Restart unless manually stopped
docker run -d --restart unless-stopped nginx

# Restart only on failure (with max attempts)
docker run -d --restart on-failure:5 nginx
```

**Real-world usage:**

```bash
# Production database - always keep running
docker run -d --restart always --name db postgres

# Development server - don't restart if I stopped it
docker run -d --restart unless-stopped --name dev_server nginx
```

**Check restart policy:**

```bash
docker inspect --format='{{.HostConfig.RestartPolicy.Name}}' myapp
```

### 5.6 Exit Codes

**When container stops, it has an exit code:**

- **0** - Success (clean exit)
- **1** - Application error
- **137** - Killed by SIGKILL (docker kill)
- **139** - Segmentation fault
- **143** - Terminated by SIGTERM (docker stop)

**Check exit code:**

```bash
docker ps -a
# Look at STATUS column:
# "Exited (0)" = success
# "Exited (1)" = error
```

**Why this matters:**

```bash
# This container will restart only if it crashes (exit code != 0)
docker run -d --restart on-failure my-app

# Exit 0 = won't restart (intentional stop)
# Exit 1 = will restart (error, try again)
```

### 5.7 Container Lifecycle Example

**Practical scenario:**

```bash
# Day 1: Start a database
docker run -d --name mydb --restart unless-stopped -p 5432:5432 postgres

# Check it's running
docker ps
# STATUS: Up X minutes

# Day 2: Need to restart server (maintenance)
sudo reboot

# After reboot, container auto-starts (--restart unless-stopped)
docker ps
# STATUS: Up X seconds

# Day 5: Need to upgrade database
docker stop mydb
# Gracefully stops, waits for queries to complete

# Upgrade to new version
docker rm mydb
docker run -d --name mydb --restart unless-stopped -p 5432:5432 postgres:15

# Container won't auto-restart on its own because we stopped it manually
# But after reboot, it will start (unless-stopped policy)
```

### 5.8 Viewing Container History

**See changes made to a container:**

```bash
docker diff <container_id>
```

**Output shows:**

- A = Added file
- C = Changed file
- D = Deleted file

**Example:**

```bash
docker run -d --name test nginx
docker exec test touch /tmp/newfile.txt
docker diff test
# Shows: A /tmp/newfile.txt
```

### 5.9 Container Events

**Monitor Docker events in real-time:**

```bash
docker events

# In another terminal, start/stop containers
# You'll see events like:
# container create
# container start
# container stop
# container destroy
```

**Filter events:**

```bash
# Only container events
docker events --filter type=container

# Events from specific container
docker events --filter container=myapp
```

### 5.10 Lifecycle Cheat Sheet

```bash
# Create and start
docker run -d --name app nginx               # Create + start
docker create --name app nginx               # Create only
docker start app                             # Start created/stopped container

# Control running containers
docker stop app                              # Graceful stop (10s timeout)
docker stop -t 30 app                        # Stop with 30s timeout
docker kill app                              # Force stop immediately
docker restart app                           # Stop + start
docker pause app                             # Freeze (keep in memory)
docker unpause app                           # Resume frozen container

# Restart policies
--restart no                                 # Never restart
--restart always                             # Always restart
--restart unless-stopped                     # Restart unless manually stopped
--restart on-failure:5                       # Restart max 5 times on error

# Cleanup
docker rm app                                # Remove stopped container
docker rm -f app                             # Force remove (even running)
docker rm $(docker ps -a -q)                 # Remove all stopped containers
docker container prune                       # Remove all stopped containers

# Information
docker ps -a                                 # All containers with status
docker inspect app                           # Detailed info
docker diff app                              # File changes
docker events                                # Real-time events
```

---

## 6. Container Management

### 6.1 Inspecting Containers

**Get complete container information:**

```bash
docker inspect <container_id>
```

**Returns JSON with everything:**

- Configuration
- Network settings
- Mounts
- State
- Resource limits

**Extract specific info:**

```bash
# Get IP address
docker inspect -f '{{.NetworkSettings.IPAddress}}' myapp

# Get current status
docker inspect -f '{{.State.Status}}' myapp

# Get port mappings
docker inspect -f '{{.NetworkSettings.Ports}}' myapp

# Get environment variables
docker inspect -f '{{.Config.Env}}' myapp
```

### 6.2 Executing Commands in Running Containers

**`docker exec` - Run command in existing container:**

```bash
# Run bash shell (interactive)
docker exec -it myapp bash

# Run single command
docker exec myapp ls /app

# Run as specific user
docker exec -u root myapp whoami
```

**Common use cases:**

```bash
# Debug inside container
docker exec -it myapp bash
ls
cat /app/config.txt
exit

# Check logs inside container
docker exec myapp cat /var/log/app.log

# Database operations
docker exec -it postgres_db psql -U postgres

# Install debugging tools
docker exec -it myapp apt update
docker exec -it myapp apt install -y curl
```

**Important:** `exec` runs in EXISTING container. Container must be running!

### 6.3 Copying Files

**Copy files between host and container:**

**From host to container:**

```bash
docker cp /path/on/host/file.txt myapp:/path/in/container/
```

**From container to host:**

```bash
docker cp myapp:/path/in/container/file.txt /path/on/host/
```

**Examples:**

```bash
# Copy config file into container
docker cp config.json web_server:/app/config.json

# Extract logs from container
docker cp web_server:/var/log/app.log ./logs/

# Copy entire directory
docker cp ./myapp/ container_name:/app/

# Copy from stopped container (works!)
docker cp stopped_container:/data/backup.sql ./
```

### 6.4 Viewing Logs

**`docker logs` - See container output:**

```bash
# View all logs
docker logs myapp

# Follow logs (live, like tail -f)
docker logs -f myapp

# Last 100 lines
docker logs --tail 100 myapp

# Logs since specific time
docker logs --since 30m myapp        # Last 30 minutes
docker logs --since 2024-01-01 myapp # Since date

# With timestamps
docker logs -t myapp
```

**Practical examples:**

```bash
# Debug why container keeps crashing
docker logs --tail 50 crashed_app

# Monitor web server traffic
docker logs -f --tail 20 nginx_server

# Find errors
docker logs myapp | grep ERROR

# Save logs to file
docker logs myapp > app_logs.txt
```

### 6.5 Resource Usage

**`docker stats` - Monitor resource usage:**

```bash
# All running containers
docker stats

# Specific containers
docker stats container1 container2

# One-time snapshot (not continuous)
docker stats --no-stream
```

**Output shows:**

- **CPU %** - Percentage of CPU used
- **MEM USAGE / LIMIT** - Memory used vs limit
- **MEM %** - Percentage of memory used
- **NET I/O** - Network in/out
- **BLOCK I/O** - Disk read/write
- **PIDS** - Number of processes

**Example:**

```
CONTAINER ID   NAME      CPU %   MEM USAGE / LIMIT     MEM %
a1b2c3d4e5f6   web       0.50%   50MiB / 2GiB         2.44%
```

### 6.6 Attaching to Containers

**Attach to running container's output:**

```bash
docker attach myapp
```

**What this does:**

- Shows container's stdout/stderr
- Allows you to send input to container
- **Ctrl+C stops the container!** ⚠️

**Detach without stopping:**
Press `Ctrl+P` then `Ctrl+Q`

**When to use:**

- Debugging interactive applications
- Seeing output of foreground containers

**Usually better:** Use `docker logs -f` instead (safer)

### 6.7 Committing Containers

**Save container state as new image:**

```bash
docker commit <container_id> my-new-image:v1
```

**Example scenario:**

```bash
# Start Ubuntu container
docker run -it --name customized ubuntu bash

# Inside container, install software
apt update
apt install -y curl vim git
exit

# Save this container as new image
docker commit customized ubuntu-with-tools:v1

# Now you can use this custom image
docker run -it ubuntu-with-tools:v1 bash
# curl, vim, git are already installed!
```

**Important:**

- Not recommended for production (use Dockerfile instead)
- Good for quick experiments
- Creates large images

### 6.8 Renaming Containers

```bash
docker rename old_name new_name
```

**Example:**

```bash
docker run -d --name webserver nginx
docker rename webserver production_web
docker ps  # Shows "production_web"
```

### 6.9 Updating Container Configuration

**Some settings can be updated without recreating:**

```bash
# Update restart policy
docker update --restart always myapp

# Update resource limits
docker update --memory 512m myapp
docker update --cpus 2 myapp

# Update multiple containers
docker update --restart always $(docker ps -q)
```

### 6.10 Export and Import

**Export container filesystem:**

```bash
docker export myapp > myapp.tar
```

**Import as image:**

```bash
docker import myapp.tar myapp:backup
```

**Use case:** Backup, migration to system without registry access

### 6.11 Container Management Best Practices

**1. Always name your containers:**

```bash
# ❌ Bad
docker run -d nginx

# ✅ Good
docker run -d --name production_web nginx
```

**2. Use restart policies:**

```bash
# Production services
docker run -d --restart unless-stopped --name db postgres
```

**3. Clean up regularly:**

```bash
# Remove stopped containers
docker container prune

# Remove all stopped containers + unused resources
docker system prune
```

**4. Check logs before removing:**

```bash
docker logs myapp > logs_backup.txt
docker rm myapp
```

**5. Use meaningful tags:**

```bash
# ❌ Bad
docker commit myapp myapp

# ✅ Good
docker commit myapp myapp:v1.2-production
```

### 6.12 Container Management Cheat Sheet

```bash
# Inspection
docker inspect <container>                   # Full details (JSON)
docker inspect -f '{{.State.Status}}' <c>    # Extract specific field
docker ps -a                                 # List all containers
docker stats                                 # Resource usage
docker top <container>                       # Running processes

# Execution
docker exec -it <container> bash             # Interactive shell
docker exec <container> <command>            # Run command
docker exec -u root <container> <cmd>        # Run as specific user

# Logs
docker logs <container>                      # All logs
docker logs -f <container>                   # Follow logs
docker logs --tail 100 <container>           # Last N lines
docker logs --since 30m <container>          # Time filter
docker logs -t <container>                   # With timestamps

# Files
docker cp host_file <container>:/path        # Copy to container
docker cp <container>:/path host_file        # Copy from container

# Control
docker attach <container>                    # Attach to container
docker rename old new                        # Rename container
docker update --restart always <container>   # Update settings
docker commit <container> <image>            # Save as image
docker export <container> > file.tar         # Export filesystem

# Cleanup
docker rm <container>                        # Remove stopped
docker rm -f <container>                     # Force remove
docker container prune                       # Remove all stopped
docker system prune                          # Remove unused resources
```

---

## 7. Port Mapping & Networking

### 7.1 Understanding Ports

**What is a port?**

Think of your computer as an apartment building:

- Building address = Your computer's IP (localhost)
- Apartment number = Port (1 to 65535)
- Different services = Different apartments

**Common ports:**

```
Port 80    → HTTP (web servers)
Port 443   → HTTPS (secure web)
Port 22    → SSH
Port 3000  → Node.js apps
Port 3306  → MySQL
Port 5432  → PostgreSQL
Port 27017 → MongoDB
Port 6379  → Redis
Port 8080  → Alternative HTTP
```

### 7.2 The Port Mapping Problem

**Without Docker:**

```
Your Computer
Port 80 → Web Server
```

Simple!

**With Docker:**

```
Your Computer          Container (Isolated!)
Port 80    ?          Port 80 (web server)
```

**Problem:** Container port 80 is INSIDE the container. Your computer can't access it directly!

**Solution:** Port mapping creates a tunnel:

```
Your Computer          Container
Port 8080  ←──────→   Port 80
(mapped)              (internal)
```

### 7.3 Port Mapping Syntax

**Basic format:**

```bash
docker run -p HOST_PORT:CONTAINER_PORT image
           ↑ Your computer    ↑ Inside container
```

**Examples:**

```bash
# Map port 8080 on host to port 80 in container
docker run -d -p 8080:80 nginx
# Access: http://localhost:8080

# Map port 3000 to port 3000
docker run -d -p 3000:3000 my-node-app
# Access: http://localhost:3000

# Map port 5433 to port 5432 (PostgreSQL)
docker run -d -p 5433:5432 postgres
# Connect: localhost:5433
```

### 7.4 Why Different Ports?

**Scenario:** Run 3 web servers simultaneously

```bash
# ❌ This fails:
docker run -d -p 80:80 --name web1 nginx
docker run -d -p 80:80 --name web2 nginx  # ERROR: Port 80 already in use!

# ✅ This works:
docker run -d -p 8081:80 --name web1 nginx
docker run -d -p 8082:80 --name web2 nginx
docker run -d -p 8083:80 --name web3 nginx
```

**Access:**

- web1: `http://localhost:8081`
- web2: `http://localhost:8082`
- web3: `http://localhost:8083`

**All use port 80 INSIDE their containers, but different ports on YOUR computer!**

### 7.5 Multiple Port Mappings

**Map multiple ports for one container:**

```bash
docker run -d \
  -p 3000:3000 \
  -p 8080:8080 \
  -p 9229:9229 \
  my-app
```

**Use case:** App on 3000, admin panel on 8080, debugger on 9229

### 7.6 Dynamic Port Mapping

**Let Docker choose random port:**

```bash
docker run -d -P nginx
# -P (capital P) = publish all exposed ports to random high ports
```

**Find assigned port:**

```bash
docker ps
# PORTS column shows: 0.0.0.0:32768->80/tcp
# Access: http://localhost:32768
```

**Or programmatically:**

```bash
docker port <container_id> 80
# Shows: 0.0.0.0:32768
```

### 7.7 Binding to Specific Interface

**Bind to localhost only (more secure):**

```bash
docker run -d -p 127.0.0.1:8080:80 nginx
# Only accessible from localhost, NOT from network
```

**Bind to specific IP:**

```bash
docker run -d -p 192.168.1.100:8080:80 nginx
# Only accessible from that specific IP
```

**Bind to all interfaces (default):**

```bash
docker run -d -p 8080:80 nginx
# Same as: -p 0.0.0.0:8080:80
# Accessible from anywhere
```

### 7.8 UDP Ports

**Default is TCP, but you can specify UDP:**

```bash
# UDP port
docker run -d -p 53:53/udp dns-server

# Both TCP and UDP
docker run -d \
  -p 53:53/tcp \
  -p 53:53/udp \
  dns-server
```

### 7.9 Port Mapping vs EXPOSE

**EXPOSE in Dockerfile (documentation only):**

```dockerfile
EXPOSE 80
```

- Documents which port app uses
- Does NOT actually publish the port
- Like a note saying "this app listens on port 80"

**-p flag (actually publishes):**

```bash
docker run -p 8080:80 nginx
```

- Actually makes port accessible
- Creates the tunnel

**Think of it:**

- EXPOSE = Sign on door: "Office hours 9-5"
- -p = Actually opening the door

### 7.10 Checking Port Mappings

**View ports for running container:**

```bash
# Using docker ps
docker ps
# Look at PORTS column

# Using docker port command
docker port <container_name>

# Check specific port
docker port <container_name> 80
```

### 7.11 Common Port Mapping Patterns

**Pattern 1: Development (same port both sides):**

```bash
docker run -d -p 3000:3000 my-dev-app
# Easy to remember, matches your app's config
```

**Pattern 2: Production (different ports):**

```bash
docker run -d -p 80:3000 my-prod-app
# Public sees port 80 (standard HTTP)
# Container uses port 3000 internally
```

**Pattern 3: Multiple instances:**

```bash
docker run -d -p 8081:80 --name instance1 nginx
docker run -d -p 8082:80 --name instance2 nginx
docker run -d -p 8083:80 --name instance3 nginx
# Load balancing, testing, staging environments
```

**Pattern 4: Database access:**

```bash
docker run -d -p 27017:27017 --name mongo mongo
# Use default port for compatibility with tools
```

### 7.12 Troubleshooting Port Issues

**Problem: "Port already in use"**

```bash
# Find what's using the port (Linux/Mac)
sudo lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port in Docker
docker run -d -p 8081:80 nginx
```

**Problem: "Cannot access container from browser"**

**Check:**

1. Container is running: `docker ps`
2. Port mapping is correct: `docker port <container>`
3. Firewall allows the port
4. App inside container is listening on 0.0.0.0 (not 127.0.0.1)

**Problem: "Connection refused"**

**Possible causes:**

- App inside container not running
- App listening on wrong port
- App listening on 127.0.0.1 instead of 0.0.0.0

**Debug:**

```bash
# Check if app is running inside container
docker exec <container> ps aux

# Check what ports app is listening on
docker exec <container> netstat -tlnp
```

### 7.13 Port Mapping Cheat Sheet

```bash
# Basic port mapping
-p 8080:80                    # Host 8080 → Container 80
-p 3000:3000                  # Same port both sides
-p 127.0.0.1:8080:80          # Bind to localhost only
-p 192.168.1.10:8080:80       # Bind to specific IP

# Multiple ports
-p 3000:3000 -p 8080:8080     # Map multiple ports

# UDP ports
-p 53:53/udp                  # UDP instead of TCP
-p 53:53/tcp -p 53:53/udp     # Both TCP and UDP

# Dynamic ports
-P                            # Publish all exposed ports to random ports

# Check mappings
docker ps                     # See PORTS column
docker port <container>       # Show all port mappings
docker port <container> 80    # Show mapping for port 80

# Common patterns
-p 80:3000                    # Production (standard HTTP → app port)
-p 8081:80                    # Multiple instances
-p 27017:27017                # Database (default port)
```

### 7.14 Real-World Example

**Running complete development stack:**

```bash
# Database
docker run -d \
  --name dev_db \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=secret \
  postgres

# Backend API
docker run -d \
  --name dev_api \
  -p 3000:3000 \
  my-api-app

# Frontend
docker run -d \
  --name dev_frontend \
  -p 8080:80 \
  my-frontend-app

# Redis cache
docker run -d \
  --name dev_redis \
  -p 6379:6379 \
  redis
```

**Access:**

- Database: `localhost:5432`
- API: `http://localhost:3000`
- Frontend: `http://localhost:8080`
- Redis: `localhost:6379`

**All running simultaneously, isolated, no conflicts!**

---

## 8. Container Logs & Debugging

### 8.1 Understanding Container Logs

**What are container logs?**

Everything written to:

- **stdout** (standard output) - Normal output
- **stderr** (standard error) - Error messages

**Example in code:**

```javascript
// Node.js
console.log("Server started"); // → stdout → docker logs
console.error("ERROR!"); // → stderr → docker logs
```

```python
# Python
print("Hello")                   # → stdout → docker logs
import sys
sys.stderr.write("ERROR\n")      # → stderr → docker logs
```

### 8.2 Viewing Logs

**Basic log viewing:**

```bash
# View all logs
docker logs <container>

# Real-time logs (follow)
docker logs -f <container>

# Last N lines
docker logs --tail 50 <container>

# Since timestamp
docker logs --since 2024-01-01T00:00:00 <container>

# Since relative time
docker logs --since 30m <container>  # Last 30 minutes
docker logs --since 2h <container>   # Last 2 hours

# Until timestamp
docker logs --until 2024-01-01T12:00:00 <container>

# With timestamps
docker logs -t <container>

# Combine options
docker logs -f --tail 100 --since 30m <container>
```

### 8.3 Log Drivers

**Docker supports different log drivers:**

**Default: json-file**

- Logs stored as JSON
- Location: `/var/lib/docker/containers/<container-id>/<container-id>-json.log`

**Other drivers:**

- **none** - No logs
- **syslog** - System log
- **journald** - systemd journal
- **gelf** - Graylog
- **fluentd** - Fluentd
- **awslogs** - AWS CloudWatch

**Configure log driver:**

```bash
# For single container
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx

# Set globally in /etc/docker/daemon.json:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

**Why log rotation matters:**
Without limits, logs can fill your disk!

### 8.4 Debugging Running Containers

**Technique 1: Execute shell inside container**

```bash
# Get bash shell
docker exec -it <container> bash

# Or sh if bash not available
docker exec -it <container> sh

# Inside container, investigate:
ls
ps aux
cat /var/log/app.log
env
```

**Technique 2: Check running processes**

```bash
docker top <container>
```

**Technique 3: View resource usage**

```bash
docker stats <container>
```

**Technique 4: Inspect configuration**

```bash
docker inspect <container>
```

### 8.5 Common Debugging Scenarios

**Scenario 1: Container keeps restarting**

```bash
# Check logs for errors
docker logs --tail 100 <container>

# Check exit code
docker ps -a
# Look at STATUS: "Exited (1)" means error

# See why it crashed
docker inspect --format='{{.State.ExitCode}}' <container>
docker inspect --format='{{.State.Error}}' <container>
```

**Scenario 2: Container won't start**

```bash
# Remove -d to see output
docker run -it <image>
# You'll see errors immediately

# Check image is valid
docker images
docker inspect <image>
```

**Scenario 3: Can't connect to containerized app**

```bash
# Check container is running
docker ps

# Check port mapping
docker port <container>

# Check app is listening inside container
docker exec <container> netstat -tlnp

# Check app logs
docker logs <container>

# Test from inside container
docker exec <container> curl http://localhost:80
```

**Scenario 4: Out of memory**

```bash
# Check resource usage
docker stats <container>

# Check OOM (Out of Memory) kills
docker inspect --format='{{.State.OOMKilled}}' <container>

# Set memory limit
docker run -d --memory 512m <image>
```

### 8.6 Debugging Stopped Containers

**Container stopped but you need to investigate:**

```bash
# View logs from stopped container
docker logs <stopped_container>

# Check exit code
docker inspect --format='{{.State.ExitCode}}' <stopped_container>

# Start it with different command to debug
docker run -it --entrypoint bash <image>
# Now you can poke around
```

### 8.7 Health Checks

**Add health check to monitor container health:**

```bash
docker run -d \
  --health-cmd="curl -f http://localhost/ || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  nginx
```

**Check health status:**

```bash
docker ps
# STATUS shows: "healthy" or "unhealthy"

docker inspect --format='{{.State.Health.Status}}' <container>
```

### 8.8 Installing Debug Tools

**Container might not have debugging tools:**

```bash
# Example: minimal Alpine image
docker exec -it <container> sh

# No curl, no vim, no nothing!
# Install them:
apk update
apk add curl vim tcpdump

# Now you can debug
curl http://localhost
```

**Common packages:**

```bash
# Debian/Ubuntu
apt update
apt install -y curl wget vim netcat-openbsd net-tools

# Alpine
apk update
apk add curl wget vim netcat-openbsd bind-tools

# Red Hat/CentOS
yum install -y curl wget vim nc net-tools
```

### 8.9 Capturing and Analyzing Logs

**Save logs to file:**

```bash
docker logs <container> > app.log 2>&1
```

**Search logs:**

```bash
# Find errors
docker logs <container> | grep ERROR

# Find specific string
docker logs <container> | grep "user login"

# Count occurrences
docker logs <container> | grep ERROR | wc -l

# Last 1000 lines with errors
docker logs --tail 1000 <container> | grep ERROR
```

**Filter by time:**

```bash
# Errors in last hour
docker logs --since 1h <container> | grep ERROR

# Activity today
docker logs --since $(date +%Y-%m-%d) <container>
```

### 8.10 Debugging Network Issues

**Check container's network settings:**

```bash
# Get IP address
docker inspect --format='{{.NetworkSettings.IPAddress}}' <container>

# Get all network info
docker inspect --format='{{json .NetworkSettings}}' <container> | jq

# Ping from one container to another
docker exec container1 ping container2
```

**Test connectivity:**

```bash
# From inside container
docker exec <container> curl http://other-service:3000

# From host to container
curl http://localhost:8080

# DNS resolution
docker exec <container> nslookup google.com
```

### 8.11 Debugging File Issues

**Check if file exists:**

```bash
docker exec <container> ls -la /app/config.json
```

**View file contents:**

```bash
docker exec <container> cat /app/config.json
```

**Copy file out for inspection:**

```bash
docker cp <container>:/app/config.json ./config.json
cat config.json
```

**Check file permissions:**

```bash
docker exec <container> ls -l /app/
```

### 8.12 Debugging Environment Variables

**Check environment variables:**

```bash
# All environment variables
docker exec <container> env

# Specific variable
docker exec <container> echo $DATABASE_URL

# From docker inspect
docker inspect --format='{{.Config.Env}}' <container>
```

### 8.13 Debugging Cheat Sheet

```bash
# Logs
docker logs <container>                          # All logs
docker logs -f <container>                       # Follow (real-time)
docker logs --tail 100 <container>               # Last 100 lines
docker logs --since 30m <container>              # Last 30 minutes
docker logs -t <container>                       # With timestamps
docker logs <container> | grep ERROR             # Find errors

# Interactive debugging
docker exec -it <container> bash                 # Get shell
docker exec -it <container> sh                   # Get sh (if no bash)
docker exec <container> ps aux                   # See processes
docker exec <container> env                      # See environment vars

# Resource issues
docker stats <container>                         # Resource usage
docker top <container>                           # Running processes
docker inspect <container>                       # Full details

# Network debugging
docker inspect --format='{{.NetworkSettings.IPAddress}}' <c>  # Get IP
docker exec <container> ping other-container     # Test connectivity
docker exec <container> curl localhost:3000      # Test service
docker port <container>                          # Check port mappings

# File debugging
docker exec <container> ls -la /app              # List files
docker exec <container> cat /app/file.txt        # View file
docker cp <container>:/app/file.txt ./           # Copy file out

# Container state
docker ps -a                                     # All containers + status
docker inspect --format='{{.State.ExitCode}}' <c>  # Exit code
docker inspect --format='{{.State.Error}}' <c>   # Error message
docker inspect --format='{{.State.Health}}' <c>  # Health status

# Install debugging tools (inside container)
# Debian/Ubuntu
apt update && apt install -y curl vim netcat
# Alpine
apk update && apk add curl vim netcat-openbsd
```

### 8.14 Common Error Messages

**"docker: Error response from daemon: Conflict"**

- Container name already exists
- Solution: Remove old container or use different name

**"docker: Error response from daemon: driver failed programming external connectivity on endpoint"**

- Port already in use
- Solution: Use different port or stop process using it

**"docker: Error response from daemon: No such container"**

- Container doesn't exist or wrong name/ID
- Solution: Check with `docker ps -a`

**"exec format error"**

- Wrong architecture (ARM vs x86)
- Solution: Use correct image for your CPU

**"OCI runtime exec failed"**

- Command not found in container
- Solution: Use correct command or install it first

---

# PART 3: CREATING IMAGES

---

## 9. Understanding Dockerfiles

### 9.1 What is a Dockerfile?

**Definition:**
A text file containing instructions to build a Docker image. It's like a recipe that tells Docker how to create your image step by step.

**Analogy:**

- Dockerfile = Recipe card with instructions
- Building = Following the recipe
- Image = The prepared cake mix
- Container = Baking and serving the cake

### 9.2 Dockerfile Structure

**Basic structure:**

```dockerfile
# Comment
INSTRUCTION arguments

# Example:
FROM ubuntu:20.04
RUN apt update
CMD echo "Hello"
```

**Rules:**

- Instructions are case-insensitive (but UPPERCASE is convention)
- Each instruction creates a layer
- Lines starting with # are comments
- Must start with FROM (except ARG before FROM)

### 9.3 Basic Dockerfile Example

**Create file named `Dockerfile` (no extension):**

```dockerfile
# Use Ubuntu as base
FROM ubuntu:20.04

# Install curl
RUN apt update && apt install -y curl

# Print message when container starts
CMD echo "Container is running!"
```

**Build it:**

```bash
docker build -t myimage .
```

**Run it:**

```bash
docker run myimage
# Output: Container is running!
```

### 9.4 FROM Instruction

**Syntax:**

```dockerfile
FROM <image>:<tag>
FROM <image>@<digest>
```

**Purpose:** Specify base image to build upon

**Examples:**

```dockerfile
# Use Ubuntu 20.04
FROM ubuntu:20.04

# Use Python 3.11
FROM python:3.11

# Use Node.js 18 Alpine (smaller)
FROM node:18-alpine

# Use specific digest (immutable)
FROM nginx@sha256:abc123...

# Scratch (empty image, for minimal builds)
FROM scratch
```

**Choosing base images:**

```dockerfile
# Full OS (larger, more features)
FROM ubuntu:20.04          # ~77MB

# Language runtimes
FROM python:3.11           # ~900MB
FROM python:3.11-slim      # ~150MB
FROM python:3.11-alpine    # ~50MB

FROM node:18               # ~900MB
FROM node:18-slim          # ~200MB
FROM node:18-alpine        # ~170MB

# Minimal
FROM alpine:3.17           # ~7MB
FROM scratch               # 0MB (empty!)
```

**Best practice:** Use specific tags, not `latest`

```dockerfile
# ❌ Bad (version can change)
FROM python:latest

# ✅ Good (predictable)
FROM python:3.11-slim
```

### 9.5 RUN Instruction

**Syntax:**

```dockerfile
RUN <command>
RUN ["executable", "param1", "param2"]
```

**Purpose:** Execute commands during image build

**Examples:**

```dockerfile
# Install packages
RUN apt update && apt install -y curl vim

# Create directory
RUN mkdir -p /app/data

# Download file
RUN curl -O https://example.com/file.tar.gz

# Python packages
RUN pip install flask requests

# Node packages
RUN npm install express

# Multiple commands
RUN apt update && \
    apt install -y curl wget && \
    rm -rf /var/lib/apt/lists/*
```

**Shell form vs Exec form:**

```dockerfile
# Shell form (runs in shell: /bin/sh -c)
RUN apt update

# Exec form (no shell)
RUN ["apt", "update"]
```

**Best practices:**

```dockerfile
# ❌ Bad - Creates multiple layers
RUN apt update
RUN apt install -y curl
RUN apt install -y vim

# ✅ Good - Single layer, cleanup
RUN apt update && \
    apt install -y curl vim && \
    rm -rf /var/lib/apt/lists/*
```

### 9.6 COPY Instruction

**Syntax:**

```dockerfile
COPY <src> <dest>
COPY ["<src>", "<dest>"]
```

**Purpose:** Copy files from host to image

**Examples:**

```dockerfile
# Copy single file
COPY app.py /app/

# Copy directory
COPY ./myapp /app/

# Copy multiple files
COPY file1.txt file2.txt /app/

# Copy and rename
COPY config.json /app/production-config.json

# Copy with specific ownership
COPY --chown=user:group app.py /app/
```

**COPY vs ADD:**

```dockerfile
# COPY - Simple file copying (preferred)
COPY app.py /app/

# ADD - Can extract tarballs, download URLs (avoid unless needed)
ADD archive.tar.gz /app/     # Auto-extracts
ADD http://example.com/file /app/  # Downloads (unreliable)
```

**Best practice:** Use COPY unless you specifically need ADD's features

### 9.7 WORKDIR Instruction

**Syntax:**

```dockerfile
WORKDIR /path/to/directory
```

**Purpose:** Set working directory for subsequent instructions

**Examples:**

```dockerfile
# Set working directory
WORKDIR /app

# Now all commands run in /app
COPY . .              # Copies to /app
RUN npm install       # Runs in /app
CMD ["node", "server.js"]  # Runs from /app

# Can be used multiple times
WORKDIR /app
WORKDIR data          # Now in /app/data
WORKDIR logs          # Now in /app/data/logs
```

**Why use WORKDIR:**

```dockerfile
# ❌ Without WORKDIR (messy)
RUN mkdir /app
COPY app.py /app/
RUN cd /app && python app.py

# ✅ With WORKDIR (clean)
WORKDIR /app
COPY app.py .
RUN python app.py
```

### 9.8 CMD Instruction

**Syntax:**

```dockerfile
CMD ["executable", "param1", "param2"]    # Exec form (preferred)
CMD command param1 param2                  # Shell form
```

**Purpose:** Default command when container starts

**Examples:**

```dockerfile
# Run Python app
CMD ["python", "app.py"]

# Run Node.js server
CMD ["node", "server.js"]

# Run bash
CMD ["/bin/bash"]

# Shell form
CMD python app.py
```

**Important:** Only ONE CMD in Dockerfile (last one wins)

```dockerfile
CMD echo "First"
CMD echo "Second"   # This one is used
CMD echo "Third"    # This one is used (others ignored)
```

**Can be overridden:**

```dockerfile
# In Dockerfile
CMD ["echo", "default"]

# When running
docker run myimage              # Uses CMD: "default"
docker run myimage echo "new"   # Overrides CMD: "new"
```

### 9.9 ENTRYPOINT Instruction

**Syntax:**

```dockerfile
ENTRYPOINT ["executable", "param1"]
ENTRYPOINT command param1
```

**Purpose:** Configure container as executable

**ENTRYPOINT vs CMD:**

**CMD - Can be overridden:**

```dockerfile
CMD ["echo", "hello"]
```

```bash
docker run myimage              # Runs: echo hello
docker run myimage echo bye     # Runs: echo bye (overridden)
```

**ENTRYPOINT - Fixed command:**

```dockerfile
ENTRYPOINT ["echo"]
```

```bash
docker run myimage              # Runs: echo
docker run myimage hello        # Runs: echo hello (adds to entrypoint)
```

**Combined ENTRYPOINT + CMD:**

```dockerfile
ENTRYPOINT ["echo"]
CMD ["default message"]
```

```bash
docker run myimage              # Runs: echo "default message"
docker run myimage "custom"     # Runs: echo "custom"
```

**Practical example:**

```dockerfile
# Database container
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres"]

# Running:
docker run postgres             # Runs: docker-entrypoint.sh postgres
docker run postgres psql        # Runs: docker-entrypoint.sh psql
```

### 9.10 ENV Instruction

**Syntax:**

```dockerfile
ENV <key>=<value>
ENV <key> <value>
```

**Purpose:** Set environment variables

**Examples:**

```dockerfile
# Single variable
ENV NODE_ENV=production

# Multiple variables
ENV PORT=3000 \
    DB_HOST=localhost \
    DB_PORT=5432

# Used in subsequent instructions
ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY . $APP_HOME
```

**Accessed at runtime:**

```dockerfile
ENV DATABASE_URL=postgres://localhost/mydb

CMD echo "Connecting to $DATABASE_URL"
```

**Override at runtime:**

```bash
docker run -e DATABASE_URL=postgres://prod.db/mydb myimage
```

### 9.11 EXPOSE Instruction

**Syntax:**

```dockerfile
EXPOSE <port>
EXPOSE <port>/<protocol>
```

**Purpose:** Document which ports the app listens on

**Examples:**

```dockerfile
# Expose HTTP port
EXPOSE 80

# Expose custom port
EXPOSE 3000

# Multiple ports
EXPOSE 80 443

# UDP port
EXPOSE 53/udp

# Both TCP and UDP
EXPOSE 53/tcp 53/udp
```

**Important:** EXPOSE is documentation only! It does NOT publish the port.

```dockerfile
# In Dockerfile
EXPOSE 80

# Still need -p when running
docker run -p 8080:80 myimage
```

### 9.12 ARG Instruction

**Syntax:**

```dockerfile
ARG <name>
ARG <name>=<default>
```

**Purpose:** Build-time variables (not available at runtime)

**Examples:**

```dockerfile
# Define build argument
ARG VERSION=1.0
ARG BUILD_DATE

# Use in Dockerfile
RUN echo "Building version $VERSION"
LABEL build.date=$BUILD_DATE
```

**Pass during build:**

```bash
docker build --build-arg VERSION=2.0 --build-arg BUILD_DATE=$(date) -t myapp .
```

**ARG vs ENV:**

```dockerfile
# ARG - Only during build
ARG BUILD_ENV=development
RUN echo "Building for $BUILD_ENV"  # Works
CMD echo $BUILD_ENV                  # Empty! (not available at runtime)

# ENV - Available at runtime
ENV RUNTIME_ENV=production
CMD echo $RUNTIME_ENV                # Works!
```

### 9.13 LABEL Instruction

**Syntax:**

```dockerfile
LABEL <key>=<value>
```

**Purpose:** Add metadata to image

**Examples:**

```dockerfile
# Single label
LABEL version="1.0"

# Multiple labels
LABEL version="1.0" \
      description="My application" \
      maintainer="you@example.com"

# Common labels
LABEL org.opencontainers.image.authors="Your Name"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="2024-01-01"
```

**View labels:**

```bash
docker inspect --format='{{json .Config.Labels}}' myimage | jq
```

### 9.14 USER Instruction

**Syntax:**

```dockerfile
USER <username|UID>
```

**Purpose:** Set user for subsequent instructions and runtime

**Examples:**

```dockerfile
# Run as non-root user
RUN useradd -m appuser
USER appuser

# All subsequent commands run as appuser
COPY . /app
CMD ["./app"]
```

**Why this matters (security):**

```dockerfile
# ❌ Bad - Runs as root (security risk)
FROM ubuntu
CMD ["./app"]

# ✅ Good - Runs as non-root user
FROM ubuntu
RUN useradd -m appuser
USER appuser
CMD ["./app"]
```

### 9.15 VOLUME Instruction

**Syntax:**

```dockerfile
VOLUME ["/data"]
VOLUME /data
```

**Purpose:** Create mount point for persistent data

**Examples:**

```dockerfile
# Single volume
VOLUME /data

# Multiple volumes
VOLUME ["/data", "/logs"]

# Example: Database
FROM postgres
VOLUME /var/lib/postgresql/data
```

**We'll cover volumes in detail in Part 4!**

### 9.16 Complete Dockerfile Examples

**Example 1: Python Flask App**

```dockerfile
# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variable
ENV FLASK_APP=app.py

# Run as non-root user
RUN useradd -m appuser
USER appuser

# Start application
CMD ["flask", "run", "--host=0.0.0.0"]
```

**Example 2: Node.js Express App**

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Run as non-root user
USER node

# Start app
CMD ["node", "server.js"]
```

**Example 3: Nginx with Custom Config**

```dockerfile
# Use nginx Alpine
FROM nginx:alpine

# Copy custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files
COPY ./dist /usr/share/nginx/html

# Expose HTTP
EXPOSE 80

# Nginx starts automatically (from base image)
```

### 9.17 Dockerfile Best Practices Summary

```dockerfile
# ✅ Good Dockerfile Structure

# 1. Use specific base image tags
FROM python:3.11-slim

# 2. Set working directory early
WORKDIR /app

# 3. Copy dependency files first (better caching)
COPY requirements.txt .

# 4. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy source code last
COPY . .

# 6. Expose ports (documentation)
EXPOSE 8000

# 7. Use environment variables
ENV PYTHONUNBUFFERED=1

# 8. Run as non-root user
RUN useradd -m appuser
USER appuser

# 9. Define startup command
CMD ["python", "app.py"]
```

### 9.18 Dockerfile Instructions Reference

```dockerfile
# Base image
FROM image:tag

# Execute commands during build
RUN command

# Copy files from host to image
COPY source dest

# Set working directory
WORKDIR /path

# Default command when container starts
CMD ["executable", "params"]

# Configure executable
ENTRYPOINT ["executable"]

# Environment variables
ENV KEY=value

# Document ports
EXPOSE port

# Build-time variables
ARG name=default

# Metadata
LABEL key=value

# Switch user
USER username

# Create volume mount point
VOLUME /path

# Health check
HEALTHCHECK CMD command

# Signal to stop container
STOPSIGNAL signal

# Set shell
SHELL ["/bin/bash", "-c"]
```

---

## 10. Building Custom Images

### 10.1 The Build Command

**Basic syntax:**

```bash
docker build [OPTIONS] PATH
```

**Most common:**

```bash
docker build -t image_name:tag .
```

**Options:**

- `-t` - Tag (name) the image
- `.` - Build context (current directory)
- `-f` - Specify Dockerfile name
- `--build-arg` - Pass build arguments
- `--no-cache` - Don't use cache

### 10.2 Build Context

**What is build context?**

The directory Docker sends to the daemon for building. Everything in this directory can be copied into the image.

**Example:**

```bash
# Current directory is build context
docker build -t myapp .
```

**Build context includes:**

```
myproject/
├── Dockerfile
├── app.py         ← Can COPY this
├── config.json    ← Can COPY this
├── data/          ← Can COPY this
└── .git/          ← Sent but shouldn't copy (use .dockerignore)
```

**Large context = slow builds!**

### 10.3 .dockerignore File

**Purpose:** Exclude files from build context (like .gitignore)

**Create `.dockerignore` file:**

```
# Ignore git
.git
.gitignore

# Ignore dependencies (will be installed in image)
node_modules
__pycache__
*.pyc

# Ignore logs
*.log
logs/

# Ignore development files
.env
.env.local
*.swp
.DS_Store

# Ignore documentation
README.md
docs/

# Ignore test files
tests/
*.test.js
```

**Benefits:**

- Faster builds (smaller context)
- Smaller images (don't copy unnecessary files)
- Better security (don't copy secrets)

### 10.4 Building Your First Custom Image

**Project structure:**

```
my-python-app/
├── Dockerfile
├── app.py
├── requirements.txt
└── .dockerignore
```

**app.py:**

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Docker!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**requirements.txt:**

```
flask==2.3.0
```

**Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

**.dockerignore:**

```
__pycache__
*.pyc
.env
```

**Build it:**

```bash
cd my-python-app
docker build -t my-flask-app:v1 .
```

**Run it:**

```bash
docker run -d -p 5000:5000 --name flask_app my-flask-app:v1
```

**Test:**

```bash
curl http://localhost:5000
# Output: Hello from Docker!
```

### 10.5 Understanding Build Layers

**Each Dockerfile instruction creates a layer:**

```dockerfile
FROM python:3.11-slim       # Layer 1
WORKDIR /app                # Layer 2
COPY requirements.txt .     # Layer 3
RUN pip install -r req.txt  # Layer 4
COPY app.py .               # Layer 5
CMD ["python", "app.py"]    # Layer 6 (metadata, no actual layer)
```

**Layers are cached:**

```
First build:
Layer 1: Download python:3.11-slim
Layer 2: Create /app
Layer 3: Copy requirements.txt
Layer 4: Run pip install (slow!)
Layer 5: Copy app.py
Total time: 2 minutes

Second build (only app.py changed):
Layer 1: Use cache ✅
Layer 2: Use cache ✅
Layer 3: Use cache ✅ (requirements.txt didn't change)
Layer 4: Use cache ✅ (pip install skipped!)
Layer 5: Rebuild (app.py changed)
Total time: 5 seconds!
```

### 10.6 Optimizing Build Cache

**❌ Bad (rebuilds everything on code change):**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .                    # Copies everything
RUN pip install -r req.txt  # Runs every time code changes!
CMD ["python", "app.py"]
```

**✅ Good (leverages cache):**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .     # Copy deps first
RUN pip install -r req.txt  # Only runs if requirements.txt changes
COPY . .                    # Copy code last
CMD ["python", "app.py"]
```

**Why this works:**

- If only code changes, layers 1-4 are cached
- Only layer 5 rebuilds
- Much faster!

### 10.7 Tagging Images

**Tag during build:**

```bash
# Latest tag (default)
docker build -t myapp .
docker build -t myapp:latest .

# Specific version
docker build -t myapp:v1.0 .
docker build -t myapp:1.0.0 .

# Multiple tags
docker build -t myapp:v1.0 -t myapp:latest .

# With registry
docker build -t myregistry.com/myapp:v1.0 .
```

**Tag after build:**

```bash
# Tag existing image
docker tag myapp:v1.0 myapp:latest
docker tag myapp:v1.0 myregistry.com/myapp:v1.0
```

**View all tags:**

```bash
docker images myapp
```

### 10.8 Using Custom Dockerfile Name

**Sometimes you need multiple Dockerfiles:**

```
project/
├── Dockerfile          # Production
├── Dockerfile.dev      # Development
└── Dockerfile.test     # Testing
```

**Build with specific Dockerfile:**

```bash
# Use Dockerfile.dev
docker build -f Dockerfile.dev -t myapp:dev .

# Use Dockerfile.test
docker build -f Dockerfile.test -t myapp:test .
```

### 10.9 Build Arguments

**Pass variables at build time:**

**Dockerfile:**

```dockerfile
ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim

ARG APP_ENV=production
ENV APP_ENV=${APP_ENV}

RUN echo "Building for ${APP_ENV}"
```

**Build:**

```bash
# Use defaults
docker build -t myapp .

# Override arguments
docker build --build-arg PYTHON_VERSION=3.10 --build-arg APP_ENV=development -t myapp:dev .
```

**Common use cases:**

```bash
# Different base image versions
docker build --build-arg NODE_VERSION=18 -t myapp .

# Build date
docker build --build-arg BUILD_DATE=$(date) -t myapp .

# Git commit
docker build --build-arg GIT_COMMIT=$(git rev-parse HEAD) -t myapp .
```

### 10.10 Build Without Cache

**Force rebuild everything:**

```bash
docker build --no-cache -t myapp .
```

**When to use:**

- After updating base image
- When cache seems corrupted
- To ensure clean build

**Pull latest base image before build:**

```bash
docker build --pull -t myapp .
```

### 10.11 Viewing Build History

**See layers in image:**

```bash
docker history myapp:v1
```

**Output:**

```
IMAGE          CREATED        CREATED BY                                      SIZE
abc123...      2 hours ago    CMD ["python" "app.py"]                        0B
def456...      2 hours ago    COPY app.py .                                   1.5kB
ghi789...      2 hours ago    RUN pip install -r requirements.txt            50MB
...
```

### 10.12 Multi-Platform Builds

**Build for different architectures:**

```bash
# Build for AMD64 (x86_64)
docker build --platform linux/amd64 -t myapp .

# Build for ARM64 (Apple M1, Raspberry Pi)
docker build --platform linux/arm64 -t myapp .

# Build for both
docker buildx build --platform linux/amd64,linux/arm64 -t myapp .
```

### 10.13 Practical Example: Node.js App

**Complete working example:**

**Project structure:**

```
my-node-app/
├── .dockerignore
├── Dockerfile
├── package.json
├── package-lock.json
└── server.js
```

**package.json:**

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

**server.js:**

```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Dockerized Node.js!");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
```

**Dockerfile:**

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run as node user
USER node

# Start application
CMD ["npm", "start"]
```

**.dockerignore:**

```
node_modules
npm-debug.log
.git
.gitignore
.env
README.md
```

**Build:**

```bash
docker build -t my-node-app:v1 .
```

**Run:**

```bash
docker run -d -p 3000:3000 --name node_app my-node-app:v1
```

**Test:**

```bash
curl http://localhost:3000
# Output: Hello from Dockerized Node.js!
```

**Check logs:**

```bash
docker logs node_app
# Output: Server running on port 3000
```

### 10.14 Building Image Cheat Sheet

```bash
# Basic build
docker build -t myapp .
docker build -t myapp:v1.0 .

# Custom Dockerfile
docker build -f Dockerfile.dev -t myapp:dev .

# Multiple tags
docker build -t myapp:v1 -t myapp:latest .

# Build arguments
docker build --build-arg VERSION=1.0 -t myapp .

# No cache
docker build --no-cache -t myapp .

# Pull latest base image
docker build --pull -t myapp .

# Multi-platform
docker buildx build --platform linux/amd64,linux/arm64 -t myapp .

# View build history
docker history myapp

# Tag existing image
docker tag myapp:v1 myapp:latest

# Remove image
docker rmi myapp:v1

# Remove unused images
docker image prune
docker image prune -a  # Remove all unused
```

---

## 11. Dockerfile Best Practices

### 11.1 Use Specific Base Image Tags

**❌ Bad:**

```dockerfile
FROM python:latest
FROM node:latest
```

**Problems:**

- "latest" tag changes over time
- Builds not reproducible
- Might break unexpectedly

**✅ Good:**

```dockerfile
FROM python:3.11-slim
FROM node:18-alpine
FROM nginx:1.24
```

**Benefits:**

- Predictable builds
- Version control
- Easy rollback

### 11.2 Use Smaller Base Images

**Size comparison:**

```dockerfile
# Ubuntu full (~77MB)
FROM ubuntu:22.04

# Debian slim (~100MB)
FROM debian:11-slim

# Alpine (~7MB) - smallest!
FROM alpine:3.17

# Language-specific
FROM python:3.11        # ~900MB
FROM python:3.11-slim   # ~150MB
FROM python:3.11-alpine # ~50MB
```

**Trade-offs:**

**Alpine:**

- ✅ Smallest size
- ✅ Fast downloads
- ❌ Uses musl libc (some packages incompatible)
- ❌ Missing some tools

**Slim:**

- ✅ Good balance
- ✅ Compatible with most packages
- ✅ Smaller than full images

**When to use each:**

- **Alpine:** Microservices, simple apps
- **Slim:** Most applications
- **Full:** When you need specific tools/packages

### 11.3 Minimize Layers

**❌ Bad (too many layers):**

```dockerfile
FROM ubuntu
RUN apt update
RUN apt install -y curl
RUN apt install -y vim
RUN apt install -y git
RUN apt clean
```

**✅ Good (fewer layers):**

```dockerfile
FROM ubuntu
RUN apt update && \
    apt install -y curl vim git && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*
```

**Why:**

- Each RUN creates a layer
- Fewer layers = smaller image
- Faster builds

### 11.4 Optimize Layer Caching

**❌ Bad (invalidates cache on any file change):**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .                    # Copies everything first
RUN npm install             # Runs on every change!
CMD ["node", "server.js"]
```

**✅ Good (leverages cache):**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./       # Copy deps first
RUN npm install             # Cached unless deps change
COPY . .                    # Copy code last
CMD ["node", "server.js"]
```

**Principle:** Put things that change less frequently earlier in Dockerfile

### 11.5 Use .dockerignore

**Create `.dockerignore`:**

```
# Dependencies (will be installed in image)
node_modules
__pycache__
venv/
.venv/

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp

# Logs
*.log
logs/

# Environment files
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# Documentation
README.md
docs/
*.md

# Tests
tests/
**/*.test.js
**/*.spec.js

# Build artifacts
dist/
build/
```

**Benefits:**

- Smaller build context
- Faster builds
- Don't copy secrets
- Smaller images

### 11.6 Don't Run as Root

**❌ Bad (security risk):**

```dockerfile
FROM ubuntu
COPY app.py /app/
CMD ["python", "/app/app.py"]
# Runs as root!
```

**✅ Good (run as non-root user):**

```dockerfile
FROM ubuntu
RUN useradd -m -u 1000 appuser
WORKDIR /app
COPY --chown=appuser:appuser app.py .
USER appuser
CMD ["python", "app.py"]
```

**For images with existing users:**

```dockerfile
# Node.js images have 'node' user
FROM node:18-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
CMD ["node", "server.js"]

# Python images don't have default user, create one
FROM python:3.11-slim
RUN useradd -m appuser
USER appuser
WORKDIR /home/appuser
CMD ["python", "app.py"]
```

### 11.7 Use Multi-Stage Builds

**Purpose:** Smaller final images by separating build and runtime

**❌ Without multi-stage (large image):**

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install  # Includes dev dependencies!
COPY . .
RUN npm run build
CMD ["npm", "start"]
# Final image: 1.2GB (includes build tools, dev deps)
```

**✅ With multi-stage (small image):**

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install  # All dependencies
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Only production deps
COPY --from=builder /app/dist ./dist
CMD ["npm", "start"]
# Final image: 200MB (no dev deps, no build tools)
```

**We'll cover this in detail in Section 12!**

### 11.8 Combine Commands

**❌ Bad:**

```dockerfile
RUN apt update
RUN apt install -y curl
RUN curl -O https://example.com/file.tar.gz
RUN tar xzf file.tar.gz
RUN rm file.tar.gz
```

**✅ Good:**

```dockerfile
RUN apt update && \
    apt install -y curl && \
    curl -O https://example.com/file.tar.gz && \
    tar xzf file.tar.gz && \
    rm file.tar.gz && \
    apt remove -y curl && \
    apt autoremove -y && \
    rm -rf /var/lib/apt/lists/*
```

**Benefits:**

- Single layer
- Cleanup in same layer
- Smaller image

### 11.9 Clean Up in Same Layer

**❌ Bad (cache still in image):**

```dockerfile
RUN apt update
RUN apt install -y curl
RUN rm -rf /var/lib/apt/lists/*  # Too late! Previous layers still have cache
```

**✅ Good (cleanup in same RUN):**

```dockerfile
RUN apt update && \
    apt install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

**Python example:**

```dockerfile
# ❌ Bad
RUN pip install -r requirements.txt
RUN rm -rf ~/.cache/pip

# ✅ Good
RUN pip install --no-cache-dir -r requirements.txt
```

**Node.js example:**

```dockerfile
# ✅ Use npm ci instead of install
RUN npm ci --only=production && \
    npm cache clean --force
```

### 11.10 Use Specific COPY

**❌ Bad (copies everything):**

```dockerfile
COPY . .
```

**✅ Good (copy only what's needed):**

```dockerfile
COPY package*.json ./
COPY src/ ./src/
COPY public/ ./public/
```

**Benefits:**

- Better caching
- Smaller images
- Clearer dependencies

### 11.11 Leverage Build Cache

**Order matters!**

```dockerfile
# ✅ Optimal order
FROM python:3.11-slim

# 1. Things that change least
WORKDIR /app

# 2. Dependencies (change occasionally)
COPY requirements.txt .
RUN pip install -r requirements.txt

# 3. Source code (changes frequently)
COPY . .

# 4. Metadata (doesn't add layers)
EXPOSE 8000
CMD ["python", "app.py"]
```

**Rebuild simulation:**

```
Change 1: Only app.py changed
Layer 1-4: Cached ✅ (fast!)
Layer 5: Rebuild
Total time: 5 seconds

Change 2: Added new package
Layer 1-3: Cached ✅
Layer 4: Rebuild (pip install)
Layer 5: Rebuild
Total time: 30 seconds

Change 3: Changed base image
All layers: Rebuild
Total time: 2 minutes
```

### 11.12 Use HEALTHCHECK

**Add health check to monitor container:**

```dockerfile
FROM nginx

COPY index.html /usr/share/nginx/html/

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

**Parameters:**

- `--interval`: How often to check (default: 30s)
- `--timeout`: How long to wait for response (default: 30s)
- `--retries`: How many failures before unhealthy (default: 3)
- `--start-period`: Grace period before checking (default: 0s)

**Examples:**

```dockerfile
# HTTP health check
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1

# Database health check
HEALTHCHECK CMD pg_isready -U postgres || exit 1

# Custom script
HEALTHCHECK CMD /app/healthcheck.sh || exit 1

# No health check (disable inherited one)
HEALTHCHECK NONE
```

### 11.13 Document with Labels

**Add metadata:**

```dockerfile
LABEL org.opencontainers.image.authors="you@example.com"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.title="My Application"
LABEL org.opencontainers.image.description="Description here"
LABEL org.opencontainers.image.created="2024-01-01"
```

**Or combined:**

```dockerfile
LABEL org.opencontainers.image.authors="you@example.com" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.title="My Application"
```

### 11.14 Complete Best Practice Example

**Production-ready Dockerfile:**

```dockerfile
# Use specific version
FROM python:3.11-slim

# Add labels
LABEL org.opencontainers.image.authors="dev@example.com"
LABEL org.opencontainers.image.version="1.0.0"

# Set working directory
WORKDIR /app

# Copy and install dependencies first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (documentation)
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Set environment variable
ENV PYTHONUNBUFFERED=1

# Start application
CMD ["python", "src/app.py"]
```

### 11.15 Best Practices Checklist

```
✅ Use specific base image tags (python:3.11-slim, not latest)
✅ Use smallest appropriate base image (alpine, slim)
✅ Minimize number of layers (combine RUN commands)
✅ Optimize layer caching (copy deps before code)
✅ Use .dockerignore
✅ Run as non-root user (USER directive)
✅ Use multi-stage builds (covered next section)
✅ Clean up in same layer
✅ Use specific COPY (not COPY . .)
✅ Add health checks
✅ Add labels for documentation
✅ Set WORKDIR explicitly
✅ Use ENV for configuration
✅ Expose ports for documentation
✅ One process per container
```

### 11.16 Common Mistakes to Avoid

**1. Running as root:**

```dockerfile
# ❌ Don't do this
FROM ubuntu
CMD ["./app"]
```

**2. Not using .dockerignore:**

```
Sends 2GB node_modules to Docker daemon...
```

**3. Installing unnecessary packages:**

```dockerfile
# ❌ Don't install what you don't need
RUN apt install -y vim git curl wget htop
```

**4. Using latest tag:**

```dockerfile
# ❌ Unpredictable
FROM python:latest

# ✅ Specific version
FROM python:3.11-slim
```

**5. Not cleaning up:**

```dockerfile
# ❌ Cache remains in image
RUN apt update && apt install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ Cleanup in same layer
RUN apt update && apt install -y curl && rm -rf /var/lib/apt/lists/*
```

---

## 12. Multi-Stage Builds

### 12.1 What are Multi-Stage Builds?

**Problem:** Build process needs tools that runtime doesn't need

**Example scenario:**

- Build: Need compilers, build tools, dev dependencies
- Runtime: Only need compiled app, runtime dependencies

**Without multi-stage:**

```
Build tools + Dev dependencies + App + Runtime dependencies
= Large image (1-2GB)
```

**With multi-stage:**

```
Stage 1 (Build): Build tools + Dev deps + App
Stage 2 (Runtime): Only App + Runtime deps
= Small image (100-200MB)
```

### 12.2 Basic Multi-Stage Syntax

```dockerfile
# Stage 1: Build stage
FROM node:18 AS builder
# ... build steps ...

# Stage 2: Production stage
FROM node:18-alpine
# Copy only what's needed from builder
COPY --from=builder /app/dist ./dist
# ... runtime setup ...
```

**Key points:**

- Multiple FROM statements
- Name stages with AS
- Copy between stages with --from
- Only last stage becomes final image

### 12.3 Simple Example: Node.js App

**Single-stage (bad):**

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install  # Includes devDependencies!
COPY . .
RUN npm run build
CMD ["npm", "start"]

# Result: 1.2GB image
```

**Multi-stage (good):**

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install  # All dependencies for build
COPY . .
RUN npm run build  # Creates /app/dist

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Only production dependencies
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]

# Result: 200MB image
```

**Size comparison:**

- Single-stage: 1.2GB
- Multi-stage: 200MB
- **6x smaller!**

### 12.4 Practical Example: React App

**Complete production-ready build:**

```dockerfile
# Stage 1: Build React app
FROM node:18 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build
# Creates /app/build with static files

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built static files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**

```bash
docker build -t my-react-app .
docker run -d -p 80:80 my-react-app
```

**Result:**

- Build stage: 1GB+ (not in final image!)
- Final image: 25MB
- Just nginx + static files

### 12.5 Example: Python App with Compilation

**Scenario:** Python app needs to compile C extensions

```dockerfile
# Stage 1: Build stage (with compilers)
FROM python:3.11 AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install Python packages (some need compilation)
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime (no compilers needed)
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY app.py .

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Run as non-root user
RUN useradd -m appuser
USER appuser

CMD ["python", "app.py"]
```

**Benefits:**

- Build stage: Has gcc, g++ for compiling
- Final stage: Clean, no compilers
- Much smaller image

### 12.6 Example: Go Application

**Go is perfect for multi-stage builds:**

```dockerfile
# Stage 1: Build Go binary
FROM golang:1.21 AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Stage 2: Minimal runtime
FROM alpine:3.17

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

**Amazing result:**

- Build stage: 1GB+ Go toolchain
- Final image: 10-15MB!
- Just binary + Alpine

**Or even smaller with scratch:**

```dockerfile
# ... builder stage same as above ...

# Stage 2: Scratch (absolutely minimal!)
FROM scratch

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
```

**Result: 5-7MB image!** (just the binary)

### 12.7 Copying from Multiple Stages

**You can copy from multiple named stages:**

```dockerfile
# Frontend build
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Backend build
FROM golang:1.21 AS backend-builder
WORKDIR /app/backend
COPY backend/ .
RUN go build -o server

# Final stage: Combine both
FROM alpine:3.17
WORKDIR /app

# Copy frontend static files
COPY --from=frontend-builder /app/frontend/dist ./static

# Copy backend binary
COPY --from=backend-builder /app/backend/server .

EXPOSE 8080
CMD ["./server"]
```

### 12.8 Using External Images in Stages

**Copy from any image, not just build stages:**

```dockerfile
FROM alpine:3.17

# Copy from official nginx image
COPY --from=nginx:latest /etc/nginx/nginx.conf /etc/nginx/

# Copy from specific image version
COPY --from=busybox:1.36 /bin/busybox /bin/

# Rest of your Dockerfile...
```

### 12.9 Development vs Production Builds

**Use build targets for different purposes:**

```dockerfile
# Base stage (common for both)
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install  # All dependencies
COPY . .
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

**Build specific stage:**

```bash
# Development
docker build --target development -t myapp:dev .

# Production
docker build --target production -t myapp:prod .
# Or just:
docker build -t myapp:prod .  # Builds to final stage by default
```

### 12.10 Real-World Full Example

**Production Next.js application:**

```dockerfile
# Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 12.11 Debugging Multi-Stage Builds

**Build and inspect specific stage:**

```bash
# Build only up to builder stage
docker build --target builder -t myapp:builder .

# Run it to debug
docker run -it myapp:builder sh

# Inside container, check what was built
ls -la
```

**View size of each stage:**

```bash
# Build all stages with tags
docker build --target builder -t myapp:builder .
docker build --target production -t myapp:production .

# Compare sizes
docker images | grep myapp
```

### 12.12 Multi-Stage Best Practices

**1. Name your stages descriptively:**

```dockerfile
# ✅ Good
FROM node:18 AS dependencies
FROM node:18 AS builder
FROM node:18-alpine AS production

# ❌ Bad
FROM node:18 AS stage1
FROM node:18 AS stage2
```

**2. Use smallest possible final image:**

```dockerfile
# Builder: Can be large
FROM node:18 AS builder

# Final: As small as possible
FROM node:18-alpine
# Or even:
FROM alpine:3.17
# Or:
FROM scratch
```

**3. Order stages efficiently:**

```dockerfile
# Dependencies (changes rarely) first
FROM node:18 AS deps
COPY package*.json ./
RUN npm ci

# Build (uses deps)
FROM node:18 AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm build

# Production (uses build output)
FROM node:18-alpine AS production
COPY --from=builder /app/dist ./dist
```

**4. Don't copy unnecessary files:**

```dockerfile
# ❌ Bad - Copies everything from builder
COPY --from=builder /app /app

# ✅ Good - Copies only what's needed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
```

**5. Use .dockerignore:**

```
# Prevents copying to builder stage
node_modules
.git
tests/
```

### 12.13 When to Use Multi-Stage

**✅ Use multi-stage when:**

- Compiled languages (Go, Rust, C++)
- Frontend builds (React, Vue, Angular)
- Apps needing build tools
- Want smallest possible image
- Separating build and runtime dependencies

**❌ Don't need multi-stage when:**

- Interpreted languages with no build step
- Already using minimal image
- Simple scripts
- Size not a concern

### 12.14 Multi-Stage Cheat Sheet

```dockerfile
# Basic pattern
FROM base:tag AS stage_name
# Build steps
FROM smaller:tag
COPY --from=stage_name /path /path

# Multiple stages
FROM image1 AS stage1
# ...
FROM image2 AS stage2
COPY --from=stage1 /path /path
# ...
FROM image3
COPY --from=stage1 /path1 /path1
COPY --from=stage2 /path2 /path2

# Build specific stage
$ docker build --target stage_name -t image:tag .

# Copy from external image
COPY --from=nginx:latest /etc/nginx/nginx.conf /etc/nginx/

# Development vs Production
FROM base AS development
# dev stuff
FROM base AS production
# prod stuff
$ docker build --target development -t app:dev .
$ docker build --target production -t app:prod .
```

---

## Data Persistence, Docker Compose, Networking & Advanced Topics

---

# PART 4: DATA PERSISTENCE

---

## 13. Understanding Container Data

### 13.1 The Ephemeral Nature of Containers

**Key concept:** By default, container data is TEMPORARY

**What this means:**

```bash
# Start a container
docker run -d --name mydb postgres

# Container creates data (inside container filesystem)
# Database files, logs, etc.

# Stop and remove container
docker stop mydb
docker rm mydb

# ALL DATA IS GONE! ❌
```

**Why this happens:**

- Containers are designed to be disposable
- Container filesystem is isolated
- When container is deleted, its filesystem is deleted

### 13.2 Container Filesystem Layers

**How container filesystem works:**

```
Image Layers (Read-Only)
├── Layer 4: Your app
├── Layer 3: Dependencies
├── Layer 2: Runtime
└── Layer 1: Base OS

Container Layer (Read-Write) ← Your data goes here
└── When container deleted, this layer is deleted!
```

**Example:**

```bash
# Start nginx container
docker run -d --name web nginx

# Create file inside container
docker exec web touch /usr/share/nginx/html/test.html

# File exists
docker exec web ls /usr/share/nginx/html/test.html
# Output: /usr/share/nginx/html/test.html

# Remove container
docker rm -f web

# Start new container from same image
docker run -d --name web nginx

# File is GONE!
docker exec web ls /usr/share/nginx/html/test.html
# Output: No such file or directory
```

### 13.3 Three Ways to Persist Data

Docker provides three mechanisms for data persistence:

**1. Volumes (Recommended)**

- Managed by Docker
- Stored in Docker's directory
- Persists after container deletion
- Can be shared between containers
- Best for databases, logs, etc.

**2. Bind Mounts**

- Mount specific host directory into container
- Full control over location
- Good for development
- Source code, config files, etc.

**3. tmpfs mounts (Memory only)**

- Stored in host memory
- Never written to disk
- Lost on container stop
- For sensitive temporary data

### 13.4 Visual Comparison

```
VOLUMES (Docker-managed)
Host: /var/lib/docker/volumes/my_volume
Container: /data
✅ Persists after container deletion
✅ Docker manages storage
✅ Can share between containers

BIND MOUNTS (Host path)
Host: /home/user/myapp
Container: /app
✅ Direct access from host
✅ You choose exact location
✅ Good for development

TMPFS (Memory)
Host: RAM
Container: /tmp
✅ Fast (in memory)
✅ Never touches disk
❌ Lost when container stops
```

### 13.5 When to Use Each

**Use Volumes when:**

- Production databases
- Application data that must persist
- Sharing data between containers
- Backups and migrations
- You want Docker to manage it

**Use Bind Mounts when:**

- Development (live code editing)
- Sharing config files
- Logs accessible from host
- Full control over file location

**Use tmpfs when:**

- Sensitive temporary files
- Caching
- Session data
- Files that shouldn't touch disk

---

## 14. Volumes

### 14.1 Creating Volumes

**Create volume explicitly:**

```bash
# Create named volume
docker volume create my_volume

# List volumes
docker volume ls

# Inspect volume
docker volume inspect my_volume
```

**Output of inspect:**

```json
[
  {
    "CreatedAt": "2024-01-01T10:00:00Z",
    "Driver": "local",
    "Labels": {},
    "Mountpoint": "/var/lib/docker/volumes/my_volume/_data",
    "Name": "my_volume",
    "Options": {},
    "Scope": "local"
  }
]
```

### 14.2 Using Volumes with Containers

**Mount volume to container:**

```bash
# Using -v flag
docker run -d \
  --name mycontainer \
  -v my_volume:/data \
  ubuntu

# Using --mount flag (more explicit, recommended)
docker run -d \
  --name mycontainer \
  --mount source=my_volume,target=/data \
  ubuntu
```

**Format:**

- `-v volume_name:container_path`
- `--mount source=volume_name,target=container_path`

### 14.3 Practical Example: PostgreSQL Database

**Problem:** Database data disappears when container is removed

**Solution:** Use volume for data persistence

```bash
# Create volume for database data
docker volume create postgres_data

# Run PostgreSQL with volume
docker run -d \
  --name postgres_db \
  -e POSTGRES_PASSWORD=secret \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres

# Add some data
docker exec -it postgres_db psql -U postgres -c "CREATE DATABASE myapp;"
docker exec -it postgres_db psql -U postgres -c "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));"

# Stop and remove container
docker stop postgres_db
docker rm postgres_db

# Create new container with same volume
docker run -d \
  --name postgres_db_new \
  -e POSTGRES_PASSWORD=secret \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres

# Data still exists! ✅
docker exec -it postgres_db_new psql -U postgres -c "\l"
# Shows: myapp database is still there!
```

### 14.4 Anonymous Volumes

**Created automatically without name:**

```bash
# Docker creates anonymous volume
docker run -d -v /data nginx

# List volumes - you'll see random name
docker volume ls
# DRIVER    VOLUME NAME
# local     abc123def456...
```

**Warning:** Anonymous volumes are hard to manage and reuse!

**Better:** Always use named volumes

```bash
docker run -d -v my_data:/data nginx
```

### 14.5 Volume Drivers

**Default driver: local (host filesystem)**

```bash
# Explicitly specify driver
docker volume create --driver local my_volume
```

**Other drivers (third-party):**

- NFS - Network file system
- CIFS/SMB - Windows shares
- AWS EBS - Amazon cloud storage
- GlusterFS - Distributed storage
- Many more...

**Example with NFS:**

```bash
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/to/share \
  nfs_volume
```

### 14.6 Sharing Volumes Between Containers

**Multiple containers can use same volume:**

```bash
# Create volume
docker volume create shared_data

# Container 1 writes data
docker run -d \
  --name writer \
  -v shared_data:/data \
  ubuntu \
  bash -c "echo 'Hello from writer' > /data/message.txt"

# Container 2 reads data
docker run --rm \
  -v shared_data:/data \
  ubuntu \
  cat /data/message.txt
# Output: Hello from writer
```

**Real-world example: Web server + app server sharing uploads:**

```bash
# Create volume for uploads
docker volume create uploads

# App server (processes uploads)
docker run -d \
  --name app \
  -v uploads:/app/uploads \
  my-app-server

# Web server (serves uploads)
docker run -d \
  --name web \
  -v uploads:/usr/share/nginx/html/uploads \
  nginx
```

### 14.7 Backing Up Volumes

**Method 1: Copy from running container:**

```bash
# Container using volume
docker run -d --name db -v db_data:/var/lib/postgresql/data postgres

# Create backup
docker run --rm \
  -v db_data:/data \
  -v $(pwd):/backup \
  ubuntu \
  tar czf /backup/db_backup.tar.gz -C /data .

# Backup file created in current directory: db_backup.tar.gz
```

**Method 2: Backup helper container:**

```bash
# Backup
docker run --rm \
  -v my_volume:/source:ro \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/volume_backup.tar.gz -C /source .
```

### 14.8 Restoring Volumes

**From backup:**

```bash
# Create new volume
docker volume create restored_volume

# Restore data
docker run --rm \
  -v restored_volume:/target \
  -v $(pwd):/backup \
  ubuntu \
  bash -c "cd /target && tar xzf /backup/db_backup.tar.gz"

# Use restored volume
docker run -d \
  --name restored_db \
  -v restored_volume:/var/lib/postgresql/data \
  postgres
```

### 14.9 Copying Data Between Volumes

```bash
# Create new volume
docker volume create target_volume

# Copy from source to target
docker run --rm \
  -v source_volume:/source:ro \
  -v target_volume:/target \
  ubuntu \
  bash -c "cp -r /source/* /target/"
```

### 14.10 Removing Volumes

**Remove specific volume:**

```bash
# Stop containers using volume first
docker stop mycontainer
docker rm mycontainer

# Remove volume
docker volume rm my_volume
```

**Remove all unused volumes:**

```bash
docker volume prune

# With force (no confirmation)
docker volume prune -f
```

**Warning:** Removing volume deletes all data permanently!

### 14.11 Inspecting Volume Data

**View files in volume (without container):**

```bash
# Method 1: Temporary container
docker run --rm -it \
  -v my_volume:/data \
  ubuntu \
  ls -la /data

# Method 2: Direct access (Linux only, requires root)
sudo ls -la /var/lib/docker/volumes/my_volume/_data
```

### 14.12 Read-Only Volumes

**Mount volume as read-only:**

```bash
# Using -v with :ro
docker run -d \
  -v my_volume:/data:ro \
  ubuntu

# Using --mount
docker run -d \
  --mount source=my_volume,target=/data,readonly \
  ubuntu

# Container can read but not write
```

**Use case:** Configuration files, shared read-only data

### 14.13 Volume Cheat Sheet

```bash
# Create volume
docker volume create <name>

# List volumes
docker volume ls

# Inspect volume
docker volume inspect <name>

# Remove volume
docker volume rm <name>

# Remove all unused volumes
docker volume prune

# Use volume in container (-v flag)
docker run -v <volume>:<container_path> <image>
docker run -v <volume>:<container_path>:ro <image>  # Read-only

# Use volume in container (--mount flag)
docker run --mount source=<volume>,target=<path> <image>
docker run --mount source=<volume>,target=<path>,readonly <image>

# Backup volume
docker run --rm \
  -v <volume>:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm \
  -v <volume>:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/backup.tar.gz -C /data
```

---

## 15. Bind Mounts

### 15.1 What are Bind Mounts?

**Definition:** Mount a specific host directory/file into container

**Key difference from volumes:**

- You specify EXACT host path
- Not managed by Docker
- Direct access to host filesystem

**Syntax:**

```bash
# -v flag
docker run -v /host/path:/container/path image

# --mount flag (more explicit)
docker run --mount type=bind,source=/host/path,target=/container/path image
```

### 15.2 Basic Bind Mount Example

**Mount current directory:**

```bash
# Create a simple file
echo "Hello from host" > test.txt

# Mount current directory to /data in container
docker run --rm -it \
  -v $(pwd):/data \
  ubuntu \
  bash

# Inside container
cat /data/test.txt
# Output: Hello from host

# Create file inside container
echo "Hello from container" > /data/from_container.txt
exit

# File appears on host!
cat from_container.txt
# Output: Hello from container
```

### 15.3 Development Workflow with Bind Mounts

**Live code editing without rebuilding:**

**Project structure:**

```
my-node-app/
├── app.js
├── package.json
└── Dockerfile
```

**app.js:**

```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => console.log("Server running"));
```

**Run with bind mount:**

```bash
# Mount source code directory
docker run -d \
  --name dev_server \
  -p 3000:3000 \
  -v $(pwd):/app \
  node:18 \
  bash -c "cd /app && npm install && npm start"
```

**Now edit app.js on your host:**

```javascript
// Change response
res.send("Hello Docker!");
```

**Changes reflected immediately** (if using nodemon/hot reload)

### 15.4 Bind Mount with Docker Compose (Preview)

**docker-compose.yml:**

```yaml
version: "3"
services:
  web:
    image: node:18
    volumes:
      - ./src:/app # Bind mount
    working_dir: /app
    command: npm start
    ports:
      - "3000:3000"
```

**We'll cover Docker Compose in detail in Part 5!**

### 15.5 Read-Only Bind Mounts

**Prevent container from modifying host files:**

```bash
# Read-only mount
docker run --rm -it \
  -v $(pwd):/data:ro \
  ubuntu \
  bash

# Inside container - can read but not write
cat /data/test.txt  # Works
echo "test" > /data/new.txt  # Permission denied!
```

**Use cases:**

- Configuration files
- Source code in production
- Shared read-only resources

### 15.6 Mounting Individual Files

**Mount single file instead of directory:**

```bash
# Mount specific file
docker run --rm \
  -v $(pwd)/config.json:/app/config.json \
  my-app

# Example: Custom nginx config
docker run -d \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -p 80:80 \
  nginx
```

### 15.7 Bind Mount Permissions

**Problem:** Permission mismatches between host and container

**Example:**

```bash
# On host (you are user 1000)
echo "test" > test.txt
ls -l test.txt
# -rw-rw-r-- 1 user user 5 Jan 1 10:00 test.txt

# In container (running as root by default)
docker run --rm -v $(pwd):/data ubuntu ls -l /data/test.txt
# -rw-rw-r-- 1 1000 1000 5 Jan 1 10:00 test.txt
# Container sees file owned by UID 1000
```

**Solution 1: Run container as your user:**

```bash
docker run --rm \
  --user $(id -u):$(id -g) \
  -v $(pwd):/data \
  ubuntu \
  touch /data/newfile.txt

# File created with your ownership
ls -l newfile.txt
# -rw-r--r-- 1 youruser yourgroup 0 Jan 1 10:00 newfile.txt
```

**Solution 2: Chown inside container:**

```dockerfile
# In Dockerfile
RUN useradd -u 1000 appuser
USER appuser
```

### 15.8 Practical Examples

**Example 1: Development Environment**

```bash
# Web development with live reload
docker run -d \
  --name web_dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \  # Prevent overwriting node_modules
  node:18 \
  bash -c "cd /app && npm install && npm run dev"
```

**Example 2: Database with Config File**

```bash
# Custom PostgreSQL config
docker run -d \
  --name postgres_custom \
  -v postgres_data:/var/lib/postgresql/data \  # Volume for data
  -v $(pwd)/postgresql.conf:/etc/postgresql/postgresql.conf:ro \  # Bind mount for config
  -e POSTGRES_PASSWORD=secret \
  postgres \
  -c 'config_file=/etc/postgresql/postgresql.conf'
```

**Example 3: Log Files**

```bash
# Access logs on host
mkdir logs

docker run -d \
  --name app \
  -v $(pwd)/logs:/var/log/app \
  my-app

# Logs appear in ./logs/ on host
tail -f logs/app.log
```

### 15.9 Bind Mounts vs Volumes

| Feature           | Bind Mounts            | Volumes                      |
| ----------------- | ---------------------- | ---------------------------- |
| Location          | You specify exact path | Docker manages               |
| Portability       | Path-dependent         | Portable                     |
| Performance       | Good                   | Better (esp. on Mac/Windows) |
| Docker management | No                     | Yes                          |
| Sharing           | Via host path          | Via volume name              |
| Best for          | Development, configs   | Production data, databases   |

### 15.10 Common Bind Mount Patterns

**Pattern 1: Source code mounting:**

```bash
-v $(pwd)/src:/app/src
```

**Pattern 2: Config files:**

```bash
-v $(pwd)/config:/etc/config:ro
```

**Pattern 3: Log files:**

```bash
-v $(pwd)/logs:/var/log/app
```

**Pattern 4: Development with dependencies:**

```bash
-v $(pwd):/app
-v /app/node_modules  # Anonymous volume to preserve node_modules
```

### 15.11 Troubleshooting Bind Mounts

**Problem: Changes not reflected**

**Check:**

1. Path is correct
2. File exists on host
3. Application caching
4. Need to restart process

**Problem: Permission denied**

**Solutions:**

```bash
# Run as your user
docker run --user $(id -u):$(id -g) ...

# Make files readable/writable
chmod -R 755 /path/to/mount
```

**Problem: Files created by container owned by root**

**Solutions:**

```bash
# Run as non-root user
docker run --user 1000:1000 ...

# Or in Dockerfile
USER appuser
```

### 15.12 Bind Mount Cheat Sheet

```bash
# Basic bind mount
-v /host/path:/container/path
-v $(pwd):/app
-v /absolute/path:/container/path

# Read-only
-v /host/path:/container/path:ro

# Mount file (not directory)
-v /host/file.txt:/container/file.txt

# Using --mount (explicit)
--mount type=bind,source=/host/path,target=/container/path
--mount type=bind,source=/host/path,target=/container/path,readonly

# Run as specific user (avoid permission issues)
--user $(id -u):$(id -g)

# Anonymous volume to protect directory
-v /container/path  # Not overwritten by bind mount

# Current directory shortcuts
-v $(pwd):/app        # Linux/Mac
-v %cd%:/app          # Windows CMD
-v ${PWD}:/app        # Windows PowerShell
```

---

## 16. Volume Management

### 16.1 Volume Lifecycle

```
Create → Use → Backup → Restore → Remove
   ↑                                  ↓
   └──────────── Recreate ────────────┘
```

**Full lifecycle example:**

```bash
# 1. Create
docker volume create app_data

# 2. Use
docker run -d \
  --name app \
  -v app_data:/data \
  my-app

# 3. Backup
docker run --rm \
  -v app_data:/source \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz -C /source .

# 4. Stop app
docker stop app
docker rm app

# 5. Remove volume
docker volume rm app_data

# 6. Restore
docker volume create app_data_restored
docker run --rm \
  -v app_data_restored:/target \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/backup.tar.gz -C /target

# 7. Use restored data
docker run -d \
  --name app_new \
  -v app_data_restored:/data \
  my-app
```

### 16.2 Listing and Filtering Volumes

**List all volumes:**

```bash
docker volume ls
```

**Filter by dangling (unused):**

```bash
docker volume ls -f dangling=true
```

**Filter by driver:**

```bash
docker volume ls -f driver=local
```

**Filter by label:**

```bash
docker volume ls -f label=project=myapp
```

### 16.3 Volume Labels

**Create volume with labels:**

```bash
docker volume create \
  --label environment=production \
  --label project=myapp \
  --label backup=daily \
  prod_data
```

**Query by labels:**

```bash
docker volume ls -f label=environment=production
```

**Use in scripts:**

```bash
# Backup all production volumes
for vol in $(docker volume ls -q -f label=backup=daily); do
  docker run --rm \
    -v $vol:/source \
    -v $(pwd)/backups:/backup \
    ubuntu tar czf /backup/${vol}.tar.gz -C /source .
done
```

### 16.4 Volume Capacity and Quotas

**Docker doesn't enforce volume size limits by default**

**Check volume size:**

```bash
# Method 1: Inspect volume path
docker volume inspect my_volume --format '{{.Mountpoint}}'
sudo du -sh /var/lib/docker/volumes/my_volume/_data

# Method 2: Via container
docker run --rm \
  -v my_volume:/data \
  ubuntu \
  du -sh /data
```

**Implement soft limits (application-level):**

```bash
# Monitor volume size script
#!/bin/bash
MAX_SIZE=10G  # 10 GB limit
VOLUME=my_volume

SIZE=$(docker run --rm -v $VOLUME:/data ubuntu du -s /data | awk '{print $1}')

if [ $SIZE -gt $((10*1024*1024)) ]; then
  echo "Warning: Volume exceeds limit!"
  # Send alert, cleanup, etc.
fi
```

### 16.5 Migrating Volumes

**Between containers on same host:**

```bash
# Simply use same volume with new container
docker run -d --name new_app -v old_volume:/data new_image
```

**Between Docker hosts:**

```bash
# On source host: Export
docker run --rm \
  -v source_volume:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/volume.tar.gz -C /data .

# Transfer file to new host
scp volume.tar.gz user@newhost:/tmp/

# On destination host: Import
docker volume create dest_volume
docker run --rm \
  -v dest_volume:/data \
  -v /tmp:/backup \
  ubuntu tar xzf /backup/volume.tar.gz -C /data
```

### 16.6 Volume Monitoring

**Check disk space usage:**

```bash
docker system df -v
```

**Output:**

```
VOLUME NAME    LINKS  SIZE
postgres_data  1      400MB
app_logs       0      2.5GB
redis_data     1      150MB
```

**Monitor specific volume:**

```bash
# Watch volume size
watch -n 5 'docker run --rm -v my_volume:/data ubuntu du -sh /data'
```

### 16.7 Volume Best Practices

**1. Name your volumes:**

```bash
# ❌ Bad
docker run -v /data myapp

# ✅ Good
docker volume create app_data
docker run -v app_data:/data myapp
```

**2. Use labels for organization:**

```bash
docker volume create \
  --label env=prod \
  --label app=web \
  --label tier=database \
  prod_web_db
```

**3. Regular backups:**

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
VOLUMES="db_data app_data config_data"

for vol in $VOLUMES; do
  docker run --rm \
    -v $vol:/source \
    -v /backups:/backup \
    ubuntu tar czf /backup/${vol}_${DATE}.tar.gz -C /source .
done

# Keep only last 7 days
find /backups -name "*.tar.gz" -mtime +7 -delete
```

**4. Document volume requirements:**

```yaml
# In docker-compose.yml or README
volumes:
  postgres_data: # Database storage - DO NOT DELETE
  uploads: # User uploaded files
  logs: # Application logs - safe to delete
```

**5. Cleanup unused volumes:**

```bash
# Weekly cleanup
docker volume prune -f
```

**6. Separate data by type:**

```bash
# Instead of single volume
docker volume create app_data

# Separate by purpose
docker volume create app_database
docker volume create app_uploads
docker volume create app_logs
```

### 16.8 Volume Troubleshooting

**Problem: Volume not mounting**

**Check:**

```bash
# Verify volume exists
docker volume ls | grep my_volume

# Inspect volume
docker volume inspect my_volume

# Check container mount
docker inspect container_name --format '{{.Mounts}}'
```

**Problem: Permission denied in volume**

**Solutions:**

```bash
# 1. Run container as correct user
docker run --user 1000:1000 -v my_volume:/data myapp

# 2. Fix permissions (dangerous - be careful!)
docker run --rm -v my_volume:/data ubuntu chown -R 1000:1000 /data
```

**Problem: Volume is full**

**Solutions:**

```bash
# 1. Check what's using space
docker run --rm -v my_volume:/data ubuntu du -h /data | sort -h

# 2. Clean up files
docker run --rm -v my_volume:/data ubuntu \
  find /data -name "*.log" -mtime +30 -delete

# 3. Expand underlying storage (host-specific)
```

### 16.9 Volume Management Cheat Sheet

```bash
# Lifecycle
docker volume create <name>
docker volume ls
docker volume inspect <name>
docker volume rm <name>
docker volume prune  # Remove unused

# With labels
docker volume create --label key=value <name>
docker volume ls -f label=key=value

# Backup
docker run --rm \
  -v <volume>:/source:ro \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz -C /source .

# Restore
docker run --rm \
  -v <volume>:/target \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/backup.tar.gz -C /target

# Size check
docker system df -v
docker run --rm -v <volume>:/data ubuntu du -sh /data

# Copy between volumes
docker run --rm \
  -v source_vol:/source:ro \
  -v dest_vol:/dest \
  ubuntu cp -a /source/. /dest/

# Inspect mount location
docker volume inspect <name> --format '{{.Mountpoint}}'
```

---

# PART 5: DOCKER COMPOSE

---

## 17. Introduction to Docker Compose

### 17.1 What is Docker Compose?

**Problem without Compose:**

```bash
# Need to run multiple containers
docker network create myapp_network

docker run -d \
  --name database \
  --network myapp_network \
  -v db_data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres

docker run -d \
  --name redis \
  --network myapp_network \
  redis

docker run -d \
  --name backend \
  --network myapp_network \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:secret@database/myapp \
  -e REDIS_URL=redis://redis:6379 \
  my-backend

docker run -d \
  --name frontend \
  --network myapp_network \
  -p 80:80 \
  my-frontend

# Too many commands! Hard to manage! 😫
```

**With Docker Compose:**

Create one file `docker-compose.yml`:

```yaml
version: "3.8"

services:
  database:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

  redis:
    image: redis

  backend:
    image: my-backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@database/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      - database
      - redis

  frontend:
    image: my-frontend
    ports:
      - "80:80"

volumes:
  db_data:
```

```bash
# One command to start everything!
docker compose up -d

# One command to stop everything!
docker compose down
```

**Benefits:**

- Single configuration file
- Easy to version control
- Reproducible environments
- Simple commands
- Define relationships between services

### 17.2 Docker Compose vs Dockerfile

**They serve different purposes:**

**Dockerfile:**

- Builds a single image
- Defines what goes INTO a container
- Like a recipe for one dish

**Docker Compose:**

- Runs multiple containers
- Defines how containers work TOGETHER
- Like a meal plan (multiple dishes)

**You use both together:**

```
Dockerfile (my-app/)
├── Build image for your app
│
docker-compose.yml
├── Use that image
└── Plus other services (database, redis, etc.)
```

### 17.3 Installing Docker Compose

**Included with Docker Desktop** (Windows/Mac)

**Linux install:**

```bash
# Download
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

**Note:** Modern Docker includes `docker compose` (space, not hyphen)

```bash
# Old: docker-compose
docker-compose up

# New: docker compose
docker compose up
```

Both work, but `docker compose` is the newer CLI.

### 17.4 Your First docker-compose.yml

**Simple web server:**

```yaml
version: "3.8"

services:
  web:
    image: nginx
    ports:
      - "8080:80"
```

**Run it:**

```bash
# Start
docker compose up

# Or in background
docker compose up -d

# Stop
docker compose down
```

**Access:** http://localhost:8080

### 17.5 Basic Compose Commands

```bash
# Start services
docker compose up              # Foreground
docker compose up -d           # Background (detached)

# Stop services
docker compose down            # Stop and remove containers
docker compose stop            # Stop but keep containers

# View running services
docker compose ps

# View logs
docker compose logs            # All services
docker compose logs web        # Specific service
docker compose logs -f         # Follow logs

# Execute command in service
docker compose exec web bash

# Restart services
docker compose restart
docker compose restart web     # Specific service

# Build images
docker compose build
docker compose up --build      # Build then start
```

---

## 18. Docker Compose Syntax

### 18.1 YAML Basics

**YAML = "YAML Ain't Markup Language"**

**Key rules:**

- Indentation matters (use spaces, not tabs!)
- Colons separate key-value pairs
- Dashes create lists
- Comments start with #

**Basic syntax:**

```yaml
# Comment
key: value
string: "quoted value"
number: 42
boolean: true

nested:
  key: value
  another: value

list:
  - item1
  - item2
  - item3

# Or inline
list2: [item1, item2, item3]
```

### 18.2 Version

```yaml
version: "3.8" # Compose file format version
```

**Common versions:**

- 3.8 (recommended - latest)
- 3.7, 3.6, etc.
- 2.x (older)

**Usually just use 3.8:**

```yaml
version: "3.8"
```

### 18.3 Services

**Services = containers you want to run**

**Basic service:**

```yaml
services:
  myservice:
    image: nginx
```

**Multiple services:**

```yaml
services:
  web:
    image: nginx

  database:
    image: postgres

  cache:
    image: redis
```

### 18.4 Image

**Use existing image from Docker Hub:**

```yaml
services:
  web:
    image: nginx:1.24 # Specific version

  db:
    image: postgres:15-alpine

  cache:
    image: redis:7
```

### 18.5 Build

**Build from Dockerfile:**

```yaml
services:
  app:
    build: . # Use Dockerfile in current directory
```

**Specify Dockerfile location:**

```yaml
services:
  app:
    build:
      context: . # Build context
      dockerfile: Dockerfile # Dockerfile name
```

**With build arguments:**

```yaml
services:
  app:
    build:
      context: .
      args:
        NODE_VERSION: 18
        BUILD_ENV: production
```

**Complete example:**

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        API_URL: http://localhost:3000
    ports:
      - "80:80"
```

### 18.6 Ports

**Publish ports to host:**

```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80" # host:container
      - "443:443" # Multiple ports
```

**Syntax variations:**

```yaml
ports:
  - "8080:80" # HOST:CONTAINER
  - "3000:3000" # Same port both sides
  - "127.0.0.1:8080:80" # Bind to specific interface
  - "8080-8085:8080-8085" # Port range
```

### 18.7 Volumes

**Named volumes:**

```yaml
services:
  db:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data: # Declare named volume
```

**Bind mounts:**

```yaml
services:
  app:
    image: node:18
    volumes:
      - ./src:/app/src # Bind mount (relative path)
      - /absolute/path:/app/data # Absolute path
```

**Multiple volumes:**

```yaml
services:
  app:
    image: myapp
    volumes:
      - app_data:/data # Named volume
      - ./config:/app/config:ro # Bind mount (read-only)
      - logs:/var/log # Another named volume

volumes:
  app_data:
  logs:
```

### 18.8 Environment Variables

**Direct assignment:**

```yaml
services:
  app:
    image: myapp
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://db/myapp
      API_KEY: abc123
```

**List format:**

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=postgres://db/myapp
```

**From .env file:**

Create `.env` file:

```
NODE_ENV=production
DATABASE_URL=postgres://db/myapp
API_KEY=secret123
```

Reference in compose:

```yaml
services:
  app:
    image: myapp
    env_file:
      - .env
```

**Mix both:**

```yaml
services:
  app:
    image: myapp
    env_file:
      - .env
    environment:
      OVERRIDE_VAR: value # Overrides .env if exists
```

### 18.9 Depends On

**Define startup order:**

```yaml
services:
  web:
    image: nginx
    depends_on:
      - app

  app:
    image: myapp
    depends_on:
      - database
      - redis

  database:
    image: postgres

  redis:
    image: redis
```

**Startup order:** database & redis → app → web

**Important:** `depends_on` only waits for container to START, not for service to be READY!

**Better: Use healthchecks (covered later)**

### 18.10 Networks

**Default:** All services can talk to each other

**Custom networks:**

```yaml
services:
  frontend:
    image: my-frontend
    networks:
      - frontend-net

  backend:
    image: my-backend
    networks:
      - frontend-net
      - backend-net

  database:
    image: postgres
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:
```

**Result:**

- Frontend can talk to Backend ✅
- Backend can talk to Database ✅
- Frontend CANNOT talk to Database ❌ (isolated)

### 18.11 Container Name

**Set specific container name:**

```yaml
services:
  web:
    image: nginx
    container_name: my_web_server # Instead of auto-generated name
```

**Default:** `project_service_1` (e.g., `myapp_web_1`)  
**With container_name:** `my_web_server`

### 18.12 Restart Policy

```yaml
services:
  app:
    image: myapp
    restart: always # Always restart
```

**Options:**

- `no` - Never restart (default)
- `always` - Always restart
- `on-failure` - Restart if exit code != 0
- `unless-stopped` - Restart unless manually stopped

### 18.13 Command

**Override default command:**

```yaml
services:
  app:
    image: ubuntu
    command: sleep infinity # Keep container running

  python:
    image: python:3.11
    command: python app.py
```

**Multiple commands:**

```yaml
services:
  app:
    image: node:18
    command: sh -c "npm install && npm start"
```

### 18.14 Complete docker-compose.yml Example

```yaml
version: "3.8"

services:
  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3000
    depends_on:
      - backend
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:secret@database:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      - database
      - cache
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

  # Database
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  # Redis Cache
  cache:
    image: redis:7-alpine
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 18.15 Compose File Reference

```yaml
version: "3.8"

services:
  service_name:
    # Image
    image: image:tag
    # Or build
    build:
      context: ./path
      dockerfile: Dockerfile
      args:
        KEY: value

    # Ports
    ports:
      - "HOST:CONTAINER"

    # Volumes
    volumes:
      - volume_name:/container/path
      - ./host/path:/container/path

    # Environment
    environment:
      KEY: value
    env_file:
      - .env

    # Dependencies
    depends_on:
      - other_service

    # Networks
    networks:
      - network_name

    # Container settings
    container_name: custom_name
    restart: always
    command: custom command

    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 3s
      retries: 3

# Declare volumes
volumes:
  volume_name:

# Declare networks
networks:
  network_name:
```

---

## 19. Multi-Container Applications

### 19.1 Full-Stack Application Example

**Project structure:**

```
myapp/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── .env
```

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-myapp}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Database password required}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - backend

  # Backend API
  backend:
    build:
      context: ./backend
      args:
        NODE_VERSION: 18
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${DB_USER:-postgres}:${DB_PASSWORD}@database:5432/${DB_NAME:-myapp}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:?JWT secret required}
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped
    networks:
      - frontend
      - backend

  # Frontend
  frontend:
    build:
      context: ./frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend
    networks:
      - frontend

volumes:
  postgres_data:
  redis_data:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

**.env file:**

```env
# Database
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=supersecret

# Security
JWT_SECRET=your-secret-key-here
```

**Commands:**

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop everything
docker compose down

# Stop and remove volumes (DELETES DATA!)
docker compose down -v
```

### 19.2 Development vs Production

**Use different compose files:**

**docker-compose.yml** (base config):

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
    environment:
      DATABASE_URL: postgres://postgres:secret@database/myapp
    depends_on:
      - database

  database:
    image: postgres:15
```

**docker-compose.override.yml** (development - loaded automatically):

```yaml
version: "3.8"

services:
  backend:
    volumes:
      - ./backend:/app # Live code reload
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
    command: npm run dev
```

**docker-compose.prod.yml** (production):

```yaml
version: "3.8"

services:
  backend:
    restart: always
    environment:
      NODE_ENV: production
    command: npm start
```

**Usage:**

```bash
# Development (uses override automatically)
docker compose up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 19.3 Scaling Services

**Run multiple instances:**

```bash
# Run 3 instances of web service
docker compose up -d --scale web=3
```

**In compose file:**

```yaml
services:
  web:
    image: nginx
    # Don't specify ports, or use port range

  loadbalancer:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

**Load balancer config (nginx.conf):**

```nginx
upstream backend {
    server web:80;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

### 19.4 Health Checks in Compose

**Define health checks:**

```yaml
services:
  database:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  backend:
    image: myapp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    depends_on:
      database:
        condition: service_healthy # Wait until healthy!
```

**Health check commands by service:**

```yaml
# PostgreSQL
test: ["CMD-SHELL", "pg_isready -U postgres"]

# MySQL
test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]

# Redis
test: ["CMD", "redis-cli", "ping"]

# HTTP service
test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]

# Custom script
test: ["CMD", "/app/healthcheck.sh"]
```

### 19.5 Resource Limits

**Limit CPU and memory:**

```yaml
services:
  backend:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: "0.50" # 50% of one CPU
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
```

**Note:** `deploy` section works with Docker Swarm. For docker-compose, use runtime flags:

```bash
docker run --memory="512m" --cpus="0.5" myapp
```

Or use v2 syntax:

```yaml
services:
  backend:
    image: myapp
    mem_limit: 512m
    cpus: 0.5
```

### 19.6 Practical Example: WordPress Site

**Complete WordPress with MySQL:**

```yaml
version: "3.8"

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: database
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: secret
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped

  database:
    image: mysql:8
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: rootsecret
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  wordpress_data:
  db_data:
```

**Start:**

```bash
docker compose up -d
```

**Access:** http://localhost:8080

**Stop:**

```bash
docker compose down
```

**Keep data but stop:**

```bash
docker compose stop
```

**Remove everything including data:**

```bash
docker compose down -v
```

### 19.7 Compose Command Cheat Sheet

```bash
# Start services
docker compose up                    # Foreground
docker compose up -d                 # Detached (background)
docker compose up --build            # Rebuild images then start
docker compose up --force-recreate   # Recreate containers

# Stop services
docker compose down                  # Stop and remove containers
docker compose down -v               # Also remove volumes
docker compose stop                  # Stop but keep containers
docker compose start                 # Start stopped containers

# Service management
docker compose ps                    # List containers
docker compose ps -a                 # All containers
docker compose logs                  # View logs
docker compose logs -f service       # Follow specific service logs
docker compose exec service bash     # Execute command
docker compose restart               # Restart all
docker compose restart service       # Restart specific service

# Building
docker compose build                 # Build all images
docker compose build service         # Build specific service
docker compose pull                  # Pull latest images

# Scaling
docker compose up -d --scale web=3   # Run 3 instances of web

# Config validation
docker compose config                # Validate and view config
docker compose config --services     # List services

# Cleanup
docker compose rm                    # Remove stopped containers
docker compose down --rmi all        # Remove containers and images
```

---

# PART 6: NETWORKING

---

## 21. Docker Networks Deep Dive

### 21.1 Container Communication Basics

**By default, containers are isolated:**

```
Container A          Container B
    ❌ ←──────→ ❌
   Can't communicate!
```

**With networking:**

```
Container A ←─ Network ─→ Container B
    ✅          ✅           ✅
   Can communicate!
```

### 21.2 DNS Resolution

**Containers can reach each other by name:**

```yaml
services:
  web:
    image: nginx

  app:
    image: myapp
    # Can connect to web using hostname "web"
    environment:
      API_URL: http://web:80
```

**Inside app container:**

```bash
curl http://web
# Works! Docker's DNS resolves "web" to web container's IP
```

### 21.3 Default Bridge Network

**When you run container without specifying network:**

```bash
docker run -d --name web nginx
# Uses default bridge network
```

**Limitations:**

- Containers can communicate via IP only
- No automatic DNS resolution
- Not recommended for production

### 21.4 User-Defined Networks

**Better approach:**

```bash
# Create network
docker network create myapp-network

# Run containers on this network
docker run -d --name web --network myapp-network nginx
docker run -d --name app --network myapp-network myapp

# Containers can reach each other by name!
docker exec app curl http://web
```

---

## 22. Network Types

### 22.1 Bridge Network (Default)

**For standalone containers on single host**

**Create:**

```bash
docker network create my-bridge
```

**Use:**

```bash
docker run -d --name web --network my-bridge nginx
```

**In Compose:**

```yaml
services:
  web:
    image: nginx
    networks:
      - my-network

networks:
  my-network:
    driver: bridge
```

### 22.2 Host Network

**Container uses host's network directly (no isolation)**

```bash
docker run -d --network host nginx
# Container's port 80 = host's port 80 (no port mapping needed!)
```

**Use case:**

- Performance-critical applications
- Need to bind to specific host interfaces

**Limitations:**

- Less isolated
- Can't run multiple containers on same port
- Linux only

### 22.3 None Network

**No networking at all**

```bash
docker run -d --network none ubuntu
# Container has no network access
```

**Use case:**

- Maximum isolation
- Containers that don't need network

### 22.4 Overlay Network

**For multi-host networking (Docker Swarm)**

```bash
docker network create --driver overlay my-overlay
```

**Use case:**

- Distributed applications
- Multiple Docker hosts
- Docker Swarm or Kubernetes

**We won't cover this in detail (advanced topic)**

---

## 23. Container Communication

### 23.1 Same Network Communication

**Containers on same network can talk:**

```bash
# Create network
docker network create myapp

# Start database
docker run -d --name db --network myapp postgres

# Start app (can connect to "db")
docker run -d --name app --network myapp \
  -e DATABASE_URL=postgres://db/myapp \
  myapp
```

**Inside app container:**

```bash
docker exec app ping db
# Works! DNS resolves "db" to database container IP
```

### 23.2 Different Network Isolation

**Containers on different networks can't communicate:**

```bash
# Create two networks
docker network create frontend
docker network create backend

# Frontend container
docker run -d --name web --network frontend nginx

# Backend container
docker run -d --name api --network backend myapi

# Can't communicate!
docker exec web ping api
# ping: api: Name or service not known
```

**Connect to multiple networks:**

```bash
# App needs to talk to both frontend and backend
docker run -d --name app \
  --network frontend \
  myapp

# Connect to second network
docker network connect backend app

# Now app can talk to both!
```

### 23.3 Connecting Existing Container

```bash
# Add container to network
docker network connect myapp mycontainer

# Remove from network
docker network disconnect myapp mycontainer
```

### 23.4 Publishing Ports

**Port publishing makes container accessible from host:**

```
Host                    Container
                        (isolated network)
Port 8080  ←─────→  Port 80
           published
```

**Without port publishing:**

```bash
docker run -d --name web nginx
# Can only access from other containers on same network
```

**With port publishing:**

```bash
docker run -d --name web -p 8080:80 nginx
# Accessible from host at localhost:8080
```

---

## 24. Custom Networks

### 24.1 Creating Custom Networks

**Create bridge network:**

```bash
docker network create --driver bridge myapp-network
```

**With specific subnet:**

```bash
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  myapp-network
```

**With labels:**

```bash
docker network create \
  --label project=myapp \
  --label environment=production \
  myapp-prod-network
```

### 24.2 Network in Docker Compose

**Basic:**

```yaml
services:
  web:
    image: nginx
    networks:
      - frontend

  app:
    image: myapp
    networks:
      - frontend
      - backend

  database:
    image: postgres
    networks:
      - backend

networks:
  frontend:
  backend:
```

**Result:**

- web ↔ app ✅
- app ↔ database ✅
- web ↔ database ❌ (isolated!)

**Custom configuration:**

```yaml
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

  backend:
    driver: bridge
    internal: true # No external access
```

### 24.3 Network Inspection

```bash
# List networks
docker network ls

# Inspect network
docker network inspect myapp-network

# See which containers are on network
docker network inspect myapp-network --format '{{json .Containers}}'
```

### 24.4 Practical Example: 3-Tier Architecture

```yaml
version: "3.8"

services:
  # Frontend (Public-facing)
  frontend:
    image: nginx
    ports:
      - "80:80"
    networks:
      - frontend-tier

  # Application (Middle tier)
  backend:
    image: myapp
    networks:
      - frontend-tier
      - backend-tier
    environment:
      DATABASE_URL: postgres://database/myapp

  # Database (Private)
  database:
    image: postgres
    networks:
      - backend-tier
    volumes:
      - db_data:/var/lib/postgresql/data

networks:
  frontend-tier:
    driver: bridge

  backend-tier:
    driver: bridge
    internal: true # No external access!

volumes:
  db_data:
```

**Network isolation:**

- frontend → backend ✅
- backend → database ✅
- frontend → database ❌
- database → internet ❌ (internal network)

### 24.5 Network Cleanup

```bash
# Remove network
docker network rm myapp-network

# Remove all unused networks
docker network prune

# Force remove (disconnect containers first)
docker network rm -f myapp-network
```

### 24.6 Network Cheat Sheet

```bash
# List networks
docker network ls

# Create network
docker network create <name>
docker network create --driver bridge <name>
docker network create --subnet 172.20.0.0/16 <name>

# Inspect network
docker network inspect <name>

# Connect container to network
docker network connect <network> <container>

# Disconnect container
docker network disconnect <network> <container>

# Remove network
docker network rm <name>

# Remove unused networks
docker network prune

# Run container on network
docker run --network <name> <image>
```

---

## Advanced Topics, Real-World Projects & Reference

---

# PART 7: ADVANCED TOPICS

---

## 25. Resource Management

### 25.1 Why Limit Resources?

**Without limits:**

- Container can use ALL host CPU/RAM
- One container can starve others
- System can become unresponsive
- OOM (Out of Memory) kills

**With limits:**

- Predictable performance
- Fair resource distribution
- Prevent runaway containers
- Better stability

### 25.2 Memory Limits

**Set memory limit:**

```bash
# Limit to 512MB
docker run -d --memory 512m nginx

# Limit with swap
docker run -d \
  --memory 512m \
  --memory-swap 1g \  # Total memory (RAM + swap)
  nginx

# No swap (memory-swap = memory)
docker run -d --memory 512m --memory-swap 512m nginx
```

**In Docker Compose:**

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          memory: 512M
```

**Or v2 syntax:**

```yaml
services:
  app:
    image: myapp
    mem_limit: 512m
    memswap_limit: 1g
```

### 25.3 CPU Limits

**CPU shares (relative weight):**

```bash
# Default is 1024
docker run -d --cpu-shares 512 app1  # Gets half resources
docker run -d --cpu-shares 1024 app2 # Gets full resources
```

**CPUs (hard limit):**

```bash
# Use at most 50% of one CPU
docker run -d --cpus 0.5 myapp

# Use at most 2 CPUs
docker run -d --cpus 2 myapp
```

**CPU period and quota:**

```bash
# 50% of CPU time
docker run -d \
  --cpu-period 100000 \
  --cpu-quota 50000 \
  myapp
```

**In Compose:**

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: "0.50"
        reservations:
          cpus: "0.25"
```

### 25.4 Monitoring Resource Usage

**Real-time monitoring:**

```bash
# All containers
docker stats

# Specific containers
docker stats container1 container2

# Format output
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# One-time snapshot (not continuous)
docker stats --no-stream
```

**Output:**

```
CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %
a1b2c3d4e5f6   web       0.50%     50MiB / 512MiB        9.77%
f6e5d4c3b2a1   db        2.30%     400MiB / 2GiB         19.53%
```

### 25.5 Practical Resource Allocation

**Example: Development Environment**

```yaml
version: "3.8"

services:
  # Frontend (lightweight)
  frontend:
    image: my-frontend
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 256M

  # Backend API (moderate)
  backend:
    image: my-backend
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G

  # Database (resource-intensive)
  database:
    image: postgres
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
        reservations:
          cpus: "0.5"
          memory: 512M

  # Cache (minimal)
  redis:
    image: redis:alpine
    deploy:
      resources:
        limits:
          cpus: "0.25"
          memory: 128M
```

### 25.6 OOM (Out of Memory) Handling

**By default:** Linux kills container when out of memory

**Disable OOM killer:**

```bash
docker run -d --oom-kill-disable myapp
```

**⚠️ Warning:** Only use with memory limits! Otherwise can freeze system.

**Check if container was OOM killed:**

```bash
docker inspect --format='{{.State.OOMKilled}}' container_name
# Output: true (if killed) or false
```

---

## 26. Health Checks

### 26.1 Why Health Checks?

**Problem:**

- Container is "running" but app crashed
- App started but not ready yet
- Service degraded but still running

**Solution:** Health checks monitor app state

### 26.2 Health Check in Dockerfile

```dockerfile
FROM nginx

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

**Parameters:**

- `--interval`: How often to check (default: 30s)
- `--timeout`: Max time for check (default: 30s)
- `--retries`: Failures before unhealthy (default: 3)
- `--start-period`: Grace period before checking (default: 0s)

**Examples:**

```dockerfile
# HTTP health check
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1

# Database check
HEALTHCHECK CMD pg_isready -U postgres || exit 1

# Custom script
HEALTHCHECK CMD /app/healthcheck.sh

# More frequent check
HEALTHCHECK --interval=10s --timeout=2s --retries=5 \
  CMD curl -f http://localhost/api/health || exit 1

# Disable inherited health check
HEALTHCHECK NONE
```

### 26.3 Health Check at Runtime

```bash
docker run -d \
  --health-cmd "curl -f http://localhost/ || exit 1" \
  --health-interval 30s \
  --health-timeout 3s \
  --health-retries 3 \
  nginx
```

### 26.4 Health Check in Docker Compose

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s

  database:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: myapp
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:3000/health",
        ]
      interval: 30s
    depends_on:
      database:
        condition: service_healthy # Wait for healthy database!
```

### 26.5 Health Check States

**Three states:**

- **starting**: Grace period, not checking yet
- **healthy**: Check passed
- **unhealthy**: Check failed multiple times

**View health status:**

```bash
# In docker ps
docker ps
# Shows health status in STATUS column

# Detailed check
docker inspect --format='{{.State.Health.Status}}' container_name

# Full health history
docker inspect --format='{{json .State.Health}}' container_name | jq
```

### 26.6 Creating Health Check Endpoint

**Example: Express.js health endpoint**

```javascript
// server.js
const express = require("express");
const app = express();

// Health check endpoint
app.get("/health", async (req, res) => {
  // Check database connection
  const dbOk = await checkDatabase();

  // Check Redis connection
  const redisOk = await checkRedis();

  if (dbOk && redisOk) {
    res.status(200).json({ status: "healthy" });
  } else {
    res.status(503).json({
      status: "unhealthy",
      database: dbOk ? "ok" : "failed",
      redis: redisOk ? "ok" : "failed",
    });
  }
});

async function checkDatabase() {
  try {
    await db.query("SELECT 1");
    return true;
  } catch (err) {
    return false;
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return true;
  } catch (err) {
    return false;
  }
}

app.listen(3000);
```

**Dockerfile with health check:**

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=40s \
  CMD node healthcheck.js || exit 1

CMD ["node", "server.js"]
```

**healthcheck.js:**

```javascript
const http = require("http");

const options = {
  host: "localhost",
  port: 3000,
  path: "/health",
  timeout: 2000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0); // Healthy
  } else {
    process.exit(1); // Unhealthy
  }
});

request.on("error", () => {
  process.exit(1); // Unhealthy
});

request.end();
```

### 26.7 Health Check Best Practices

**1. Keep checks fast (< 3 seconds)**

```dockerfile
# ✅ Good - Simple ping
HEALTHCHECK CMD curl -f http://localhost/ping

# ❌ Bad - Complex database query
HEALTHCHECK CMD curl -f http://localhost/full-system-test
```

**2. Check critical dependencies**

```javascript
// Check database, cache, external APIs
app.get('/health', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkExternalAPI()
  ]);

  const allHealthy = checks.every(c => c === true);
  res.status(allHealthy ? 200 : 503).json({ ... });
});
```

**3. Use start period for slow-starting apps**

```dockerfile
# Give app 60 seconds to start before checking
HEALTHCHECK --start-period=60s --interval=30s \
  CMD curl -f http://localhost/health || exit 1
```

**4. Return proper exit codes**

```bash
# 0 = healthy
# 1 = unhealthy
# Exit code determines health status!
```

---

## 27. Security Best Practices

### 27.1 Don't Run as Root

**❌ Bad (runs as root):**

```dockerfile
FROM ubuntu
COPY app.py /app/
CMD ["python", "/app/app.py"]
```

**✅ Good (runs as non-root user):**

```dockerfile
FROM ubuntu

# Create non-root user
RUN useradd -m -u 1000 appuser

# Set ownership
WORKDIR /app
COPY --chown=appuser:appuser app.py .

# Switch to non-root user
USER appuser

CMD ["python", "app.py"]
```

**For official images with existing users:**

```dockerfile
# Node.js images have 'node' user
FROM node:18-alpine
USER node

# Python images don't, create one
FROM python:3.11-slim
RUN useradd -m appuser
USER appuser
```

### 27.2 Use Official Images

**✅ Trusted sources:**

- Docker Official Images (verified)
- Verified Publishers
- Well-known organizations

**❌ Avoid:**

- Random user images
- Unmaintained images
- Images with no documentation

**Check image:**

```bash
# Pull only from trusted registry
docker pull nginx  # Official
docker pull bitnami/nginx  # Verified publisher

# Check image signature
docker trust inspect --pretty nginx:latest
```

### 27.3 Keep Images Updated

**Regularly update base images:**

```bash
# Pull latest
docker pull python:3.11-slim

# Rebuild images
docker compose build --pull
```

**In Dockerfile, use specific versions:**

```dockerfile
# ❌ Bad
FROM python:latest

# ✅ Good
FROM python:3.11.5-slim

# ⚡ Better - use digest for immutability
FROM python@sha256:abc123...
```

### 27.4 Scan for Vulnerabilities

**Docker Scout (built-in):**

```bash
# Scan image
docker scout cves nginx

# Quick health check
docker scout quickview nginx
```

**Trivy (third-party):**

```bash
# Install trivy
# Scan image
trivy image nginx
```

### 27.5 Limit Container Capabilities

**Containers run with many Linux capabilities by default**

**Drop all, add only needed:**

```bash
docker run -d \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  nginx
```

**In Compose:**

```yaml
services:
  web:
    image: nginx
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 27.6 Read-Only Root Filesystem

**Prevent file modifications:**

```bash
docker run -d --read-only nginx
```

**Problem:** App needs to write temp files!

**Solution:** Mount writable tmpfs:\*\*

```bash
docker run -d \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/run \
  nginx
```

**In Compose:**

```yaml
services:
  web:
    image: nginx
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### 27.7 Use Secrets (Don't Hardcode)

**❌ Bad:**

```dockerfile
ENV DATABASE_PASSWORD=supersecret
ENV API_KEY=abc123xyz
```

**✅ Good - Use environment variables:**

```bash
docker run -e DATABASE_PASSWORD=$DB_PASS myapp
```

**✅ Better - Use Docker secrets (Swarm):**

```yaml
services:
  app:
    image: myapp
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**✅ Best - Use secrets manager:**

- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

### 27.8 Limit Network Exposure

**Only expose necessary ports:**

```yaml
services:
  database:
    image: postgres
    # Don't expose database to host!
    # Only accessible from other containers

  backend:
    image: myapp
    # Only backend talks to database

  frontend:
    image: nginx
    ports:
      - "80:80" # Only frontend exposed
```

**Bind to localhost only:**

```bash
# Instead of 0.0.0.0:8080
docker run -p 127.0.0.1:8080:80 nginx
```

### 27.9 Security Cheat Sheet

```dockerfile
# Secure Dockerfile Template

# Use specific version
FROM python:3.11.5-slim

# Don't run as root
RUN useradd -m -u 1000 appuser

# Set working directory
WORKDIR /app

# Copy with correct ownership
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Use non-root port
EXPOSE 8000

# Run app
CMD ["python", "app.py"]
```

```yaml
# Secure docker-compose.yml template

version: "3.8"

services:
  app:
    build: .
    read_only: true
    cap_drop:
      - ALL
    tmpfs:
      - /tmp
    environment:
      - SECRET=${SECRET} # From .env
    networks:
      - internal
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 512M

networks:
  internal:
    internal: true # No external access
```

---

## 28. Docker Registry & Hub

### 28.1 Docker Hub Basics

**Docker Hub = GitHub for Docker images**

**Public images:**

- Free
- Anyone can pull
- Great for open source

**Private images:**

- Limited free private repos
- Paid plans for more

### 28.2 Pushing to Docker Hub

**1. Create account at hub.docker.com**

**2. Login:**

```bash
docker login
# Enter username and password
```

**3. Tag image with username:**

```bash
# Build image
docker build -t myapp .

# Tag for Docker Hub
docker tag myapp:latest username/myapp:latest
docker tag myapp:latest username/myapp:v1.0
```

**4. Push:**

```bash
docker push username/myapp:latest
docker push username/myapp:v1.0
```

**5. Pull from anywhere:**

```bash
docker pull username/myapp:latest
```

### 28.3 Private Registry

**Run your own registry:**

```bash
# Start registry
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v registry_data:/var/lib/registry \
  registry:2

# Tag image for private registry
docker tag myapp localhost:5000/myapp

# Push
docker push localhost:5000/myapp

# Pull
docker pull localhost:5000/myapp
```

### 28.4 Complete Push/Pull Example

```bash
# Build
docker build -t my-web-app .

# Tag for different registries
docker tag my-web-app:latest username/my-web-app:latest  # Docker Hub
docker tag my-web-app:latest myregistry.com/my-web-app:latest  # Private
docker tag my-web-app:latest localhost:5000/my-web-app:latest  # Local

# Push
docker push username/my-web-app:latest
docker push myregistry.com/my-web-app:latest
docker push localhost:5000/my-web-app:latest

# Pull on another machine
docker pull username/my-web-app:latest
docker run -d -p 80:80 username/my-web-app:latest
```

---

## 29. Optimization Techniques

### 29.1 Image Size Optimization

**Technique 1: Use Alpine base images**

```dockerfile
# Before (900MB)
FROM python:3.11

# After (50MB)
FROM python:3.11-alpine
```

**Technique 2: Multi-stage builds**

```dockerfile
# Build stage (large)
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage (small)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

**Technique 3: Minimize layers**

```dockerfile
# Before (multiple layers)
RUN apt update
RUN apt install -y curl
RUN apt install -y vim
RUN apt clean

# After (single layer)
RUN apt update && \
    apt install -y curl vim && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*
```

**Technique 4: Use .dockerignore**

```
node_modules
.git
.env
tests/
*.md
.dockerignore
Dockerfile
```

**Technique 5: Clean up in same layer**

```dockerfile
# ❌ Bad - Cache remains in image
RUN apt update
RUN apt install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ Good - Clean in same RUN
RUN apt update && \
    apt install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

### 29.2 Build Speed Optimization

**Order matters for caching:**

```dockerfile
# ✅ Optimal order
FROM node:18-alpine

WORKDIR /app

# 1. Copy dependency files (change rarely)
COPY package*.json ./

# 2. Install dependencies (cached unless package.json changes)
RUN npm ci

# 3. Copy source code (changes frequently)
COPY . .

# 4. Build
RUN npm run build

CMD ["npm", "start"]
```

**Use BuildKit:**

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Or for single build
DOCKER_BUILDKIT=1 docker build -t myapp .
```

**Parallel builds:**

```bash
# Build multiple images in parallel
docker compose build --parallel
```

### 29.3 Runtime Optimization

**Use health checks:**

```dockerfile
HEALTHCHECK --interval=30s CMD curl -f http://localhost/health || exit 1
```

**Set resource limits:**

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
```

**Use restart policies:**

```yaml
services:
  app:
    image: myapp
    restart: unless-stopped
```

---

# PART 8: REAL-WORLD PROJECTS

---

## 30. Project 1: Simple Web Application

**Goal:** Containerize a basic web application

### Project Structure

```
simple-web-app/
├── docker-compose.yml
├── Dockerfile
├── app.py
├── requirements.txt
└── templates/
    └── index.html
```

### app.py

```python
from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html',
                         hostname=os.environ.get('HOSTNAME', 'unknown'))

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### requirements.txt

```
flask==2.3.0
```

### templates/index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Docker Web App</title>
  </head>
  <body>
    <h1>Hello from Docker!</h1>
    <p>Container ID: {{ hostname }}</p>
  </body>
</html>
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

EXPOSE 5000

CMD ["python", "app.py"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    restart: unless-stopped
```

### Running the Project

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Test
curl http://localhost:5000

# Scale to 3 instances
docker compose up -d --scale web=3

# Stop
docker compose down
```

---

## 31. Project 2: Full-Stack MERN App

**Goal:** Complete application with MongoDB, Express, React, Node.js

### Project Structure

```
mern-app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── .env
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  # MongoDB Database
  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
    networks:
      - backend
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGO_URL=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/myapp?authSource=admin
      - PORT=3001
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend
    networks:
      - frontend
    restart: unless-stopped

volumes:
  mongo_data:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### backend/Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

CMD ["node", "server.js"]
```

### backend/server.js

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Simple schema
const ItemSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});
const Item = mongoose.model("Item", ItemSchema);

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post("/api/items", async (req, res) => {
  const item = new Item({ name: req.body.name });
  await item.save();
  res.json(item);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

### frontend/Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### .env

```env
MONGO_USER=admin
MONGO_PASSWORD=secretpassword
```

### Running the Project

```bash
# Start everything
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend

# Stop
docker compose down

# Stop and remove data
docker compose down -v
```

---

## 32. Project 3: Microservices Architecture

**Goal:** Multiple services with service discovery

### Project Structure

```
microservices/
├── docker-compose.yml
├── api-gateway/
├── user-service/
├── product-service/
└── nginx.conf
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  # API Gateway (Nginx)
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - user-service
      - product-service
    networks:
      - microservices

  # User Service
  user-service:
    build: ./user-service
    environment:
      - SERVICE_NAME=user-service
      - DB_URL=mongodb://mongodb:27017/users
    depends_on:
      - mongodb
    networks:
      - microservices
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M

  # Product Service
  product-service:
    build: ./product-service
    environment:
      - SERVICE_NAME=product-service
      - DB_URL=mongodb://mongodb:27017/products
    depends_on:
      - mongodb
    networks:
      - microservices
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "0.5"
          memory: 512M

  # Shared Database
  mongodb:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    networks:
      - microservices

  # Redis Cache
  redis:
    image: redis:alpine
    networks:
      - microservices

volumes:
  mongo_data:

networks:
  microservices:
    driver: bridge
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream user-service {
        server user-service:3000;
    }

    upstream product-service {
        server product-service:3000;
    }

    server {
        listen 80;

        location /api/users {
            proxy_pass http://user-service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/products {
            proxy_pass http://product-service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /health {
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 33. Project 4: Development Environment

**Goal:** Complete dev environment with hot reload

### docker-compose.dev.yml

```yaml
version: "3.8"

services:
  # Database
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: dev_db
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  # Backend with hot reload
  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "3000:3000"
      - "9229:9229" # Debugger port
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://dev:devpass@postgres:5432/dev_db
    volumes:
      - ./backend:/app # Live code sync
      - /app/node_modules # Preserve node_modules
    command: npm run dev
    depends_on:
      - postgres

  # Frontend with hot reload
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "8080:8080"
    environment:
      - CHOKIDAR_USEPOLLING=true # For hot reload
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  # Adminer (Database UI)
  adminer:
    image: adminer
    ports:
      - "8081:8080"
    depends_on:
      - postgres

  # Mailhog (Email testing)
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

volumes:
  postgres_dev_data:
```

### backend/Dockerfile (Multi-stage for dev/prod)

```dockerfile
# Development stage
FROM node:18-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install  # All dependencies including devDependencies
COPY . .

EXPOSE 3000 9229
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

USER node
EXPOSE 3000
CMD ["npm", "start"]
```

### Running Development Environment

```bash
# Start dev environment
docker compose -f docker-compose.dev.yml up

# Access services:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:8080
# - Database UI: http://localhost:8081
# - Email UI: http://localhost:8025

# Code changes auto-reload!

# Stop
docker compose -f docker-compose.dev.yml down

# Clean up (remove volumes)
docker compose -f docker-compose.dev.yml down -v
```

---

# APPENDICES

---

## Complete Command Reference

### Container Commands

```bash
# Run container
docker run [OPTIONS] IMAGE [COMMAND]
docker run -d                          # Detached (background)
docker run -it                         # Interactive with terminal
docker run --rm                        # Auto-remove when stopped
docker run --name <n>                  # Custom name
docker run -p 8080:80                  # Port mapping
docker run -v vol:/path                # Volume mount
docker run -e KEY=value                # Environment variable
docker run --network <n>               # Connect to network
docker run --restart always            # Restart policy
docker run --memory 512m               # Memory limit
docker run --cpus 0.5                  # CPU limit

# List containers
docker ps                              # Running
docker ps -a                           # All
docker ps -q                           # IDs only
docker ps --filter "status=exited"     # Filter

# Control containers
docker start <c>                       # Start stopped
docker stop <c>                        # Stop (graceful)
docker restart <c>                     # Restart
docker kill <c>                        # Force stop
docker pause <c>                       # Pause
docker unpause <c>                     # Unpause
docker rm <c>                          # Remove
docker rm -f <c>                       # Force remove

# Execute in container
docker exec <c> <command>              # Run command
docker exec -it <c> bash               # Interactive shell

# Logs
docker logs <c>                        # View logs
docker logs -f <c>                     # Follow
docker logs --tail 100 <c>             # Last 100 lines
docker logs --since 30m <c>            # Last 30 minutes

# Copy files
docker cp <c>:/path /local             # From container
docker cp /local <c>:/path             # To container

# Inspect
docker inspect <c>                     # Full details
docker top <c>                         # Processes
docker stats <c>                       # Resource usage
docker port <c>                        # Port mappings

# Cleanup
docker container prune                 # Remove stopped
docker rm $(docker ps -a -q)           # Remove all
```

### Image Commands

```bash
# Build image
docker build -t <name> .               # Basic build
docker build -t <name>:<tag> .         # With tag
docker build -f Dockerfile.dev .       # Custom Dockerfile
docker build --no-cache .              # No cache
docker build --build-arg KEY=val .     # Build arguments

# List images
docker images                          # All images
docker images -q                       # IDs only
docker images --filter "dangling=true" # Untagged

# Tag image
docker tag <image> <new-name>:<tag>

# Push/Pull
docker push <image>                    # Push to registry
docker pull <image>                    # Pull from registry

# Remove images
docker rmi <image>                     # Remove image
docker rmi -f <image>                  # Force remove
docker image prune                     # Remove dangling
docker image prune -a                  # Remove all unused

# Inspect
docker history <image>                 # Layer history
docker inspect <image>                 # Details
```

### Volume Commands

```bash
# Create volume
docker volume create <n>               # Create
docker volume create --label key=val <n>  # With label

# List volumes
docker volume ls                       # All
docker volume ls -q                    # IDs only
docker volume ls -f dangling=true      # Unused

# Inspect
docker volume inspect <n>

# Remove
docker volume rm <n>                   # Remove
docker volume prune                    # Remove unused

# Use volume
docker run -v <vol>:<path> <image>     # Mount volume
docker run -v $(pwd):<path> <image>    # Bind mount
docker run -v <path> <image>           # Anonymous volume

# Backup/Restore
docker run --rm \
  -v <vol>:/source \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/backup.tar.gz -C /source .

docker run --rm \
  -v <vol>:/target \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/backup.tar.gz -C /target
```

### Network Commands

```bash
# Create network
docker network create <n>              # Basic
docker network create --driver bridge <n>
docker network create --subnet 172.20.0.0/16 <n>

# List networks
docker network ls

# Inspect
docker network inspect <n>

# Connect/Disconnect
docker network connect <n> <c>         # Connect container
docker network disconnect <n> <c>      # Disconnect

# Remove
docker network rm <n>
docker network prune                   # Remove unused

# Use network
docker run --network <n> <image>
```

### Docker Compose Commands

```bash
# Start services
docker compose up                      # Foreground
docker compose up -d                   # Detached
docker compose up --build              # Build first
docker compose up --force-recreate     # Recreate containers

# Stop services
docker compose down                    # Stop and remove
docker compose down -v                 # Also remove volumes
docker compose stop                    # Stop only
docker compose start                   # Start stopped

# Service management
docker compose ps                      # List
docker compose logs                    # Logs
docker compose logs -f <s>             # Follow service
docker compose exec <s> <cmd>          # Execute
docker compose restart                 # Restart all
docker compose restart <s>             # Restart service

# Building
docker compose build                   # Build all
docker compose build <s>               # Build service
docker compose pull                    # Pull images

# Scaling
docker compose up -d --scale web=3     # Run 3 instances

# Config
docker compose config                  # Validate
docker compose config --services       # List services

# Cleanup
docker compose rm                      # Remove stopped
docker compose down --rmi all          # Remove images too
```

### System Commands

```bash
# System info
docker version                         # Version
docker info                            # System info

# Disk usage
docker system df                       # Disk usage
docker system df -v                    # Verbose

# Cleanup
docker system prune                    # Remove unused
docker system prune -a                 # Remove all unused
docker system prune -a --volumes       # Also volumes

# Events
docker events                          # Monitor events
docker events --filter type=container
```

---

## Troubleshooting Guide

### Container Won't Start

**Problem:** Container exits immediately

**Solutions:**

```bash
# 1. Check logs
docker logs <container>

# 2. Run without -d to see output
docker run -it <image>

# 3. Check exit code
docker ps -a
# Look at STATUS column

# 4. Override entrypoint to debug
docker run -it --entrypoint bash <image>
```

### Can't Connect to Container

**Problem:** Cannot access containerized app

**Check:**

```bash
# 1. Container is running
docker ps

# 2. Port mapping is correct
docker port <container>

# 3. App is listening on 0.0.0.0, not 127.0.0.1
docker exec <container> netstat -tlnp

# 4. Firewall allows port

# 5. Test from inside container
docker exec <container> curl http://localhost:80
```

### Volume Data Lost

**Problem:** Data disappears

**Causes:**

```bash
# 1. Used anonymous volume (random name)
docker volume ls  # Check for random names

# 2. Removed with -v flag
docker compose down -v  # This removes volumes!

# 3. Used container filesystem instead of volume
```

**Prevention:**

```bash
# Always use named volumes
docker volume create my_data
docker run -v my_data:/data <image>

# In Compose
volumes:
  my_data:  # Declare named volume
```

### Out of Disk Space

**Problem:** "No space left on device"

**Solutions:**

```bash
# 1. Check usage
docker system df

# 2. Remove unused
docker system prune -a
docker volume prune

# 3. Remove specific resources
docker container prune
docker image prune -a

# 4. Find large images
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}"
```

### Permission Denied

**Problem:** Cannot access files in volume

**Solutions:**

```bash
# Run as your user
docker run --user $(id -u):$(id -g) ...

# Or in Dockerfile
RUN useradd -u 1000 appuser
USER appuser

# Fix permissions in volume
docker run --rm -v my_vol:/data ubuntu chown -R 1000:1000 /data
```

### Network Issues

**Problem:** Containers can't communicate

**Check:**

```bash
# 1. Same network?
docker inspect <container> --format '{{.NetworkSettings.Networks}}'

# 2. DNS resolution
docker exec container1 ping container2

# 3. Firewall rules

# 4. Network exists
docker network ls
```

### Build Fails

**Problem:** Docker build errors

**Solutions:**

```bash
# 1. Check Dockerfile syntax
docker build -t test .

# 2. Build with no cache
docker build --no-cache -t test .

# 3. Check .dockerignore
cat .dockerignore

# 4. Check build context size
du -sh .

# 5. Increase build memory (Docker Desktop)
# Settings → Resources → Memory
```

---

## Common Patterns & Solutions

### Pattern: Development with Live Reload

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src # Live code sync
      - /app/node_modules # Preserve dependencies
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### Pattern: Database with Initialization

```yaml
version: "3.8"

services:
  database:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  db_data:
```

### Pattern: Wait for Service Ready

```yaml
services:
  database:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: myapp
    depends_on:
      database:
        condition: service_healthy # Wait for healthy!
```

### Pattern: Secrets Management

```yaml
# Use .env file
version: "3.8"

services:
  app:
    image: myapp
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
    env_file:
      - .env
```

### Pattern: Multi-Stage Build

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

---

## Glossary

**Image:** Read-only template containing application and dependencies

**Container:** Running instance of an image

**Dockerfile:** Text file with instructions to build an image

**Volume:** Persistent data storage managed by Docker

**Bind Mount:** Direct mount of host directory into container

**Network:** Virtual network connecting containers

**Registry:** Storage for Docker images (e.g., Docker Hub)

**Layer:** One instruction in Dockerfile (cached for efficiency)

**Tag:** Version label for images (e.g., `nginx:1.24`)

**Compose:** Tool for defining multi-container applications

**Service:** Container definition in docker-compose.yml

**Health Check:** Test to verify container is healthy

**Multi-Stage Build:** Dockerfile with multiple FROM statements

**Bridge Network:** Default network type for containers

**Port Mapping:** Exposing container port to host

**Environment Variable:** Configuration passed to container

**Entrypoint:** Main executable run when container starts

**CMD:** Default arguments for entrypoint

---

## 🎉 Congratulations!

You've completed the comprehensive Docker guide!

**You now know:**

- ✅ Docker fundamentals and concepts
- ✅ Working with containers and images
- ✅ Creating Dockerfiles and building images
- ✅ Data persistence with volumes
- ✅ Multi-container apps with Docker Compose
- ✅ Networking and container communication
- ✅ Security best practices
- ✅ Optimization techniques
- ✅ Real-world project patterns

**Next Steps:**

1. Practice with the projects in Part 8
2. Dockerize your own applications
3. Explore Docker Swarm or Kubernetes
4. Contribute to open source Docker projects

**Resources:**

- Docker Documentation: docs.docker.com
- Docker Hub: hub.docker.com
- Play with Docker: labs.play-with-docker.com

**Keep Learning!** 🚀
