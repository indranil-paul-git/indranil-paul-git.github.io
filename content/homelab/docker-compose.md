---
title: Docker Compose
description: A reflection on using Docker Compose as the declarative foundation for a modern, non-invasive homelab.
date: 2026-06-13
order: 10
tags:
  - docker
  - compose
  - homelab
  - self-hosted
---

The journey of self-hosting a homelab often begins with bare-metal installations—setting up services directly on a host operating system, configuring local packages, editing system files, and managing runtime dependencies. However, as the number of hosted services grows, this manual approach inevitably leads to system drift, conflicting library versions, port collisions, and an operating system cluttered with scattered configuration files.

Adopting **Docker Compose** represents a fundamental paradigm shift. It replaces configuration drift with a clean, declarative, and entirely non-invasive approach to managing a self-hosted ecosystem.

---

## The Non-Invasive Advantage

The core strength of using Docker Compose for a homelab is its **non-invasive architecture**. 

Traditionally, installing a service like a media server or a database engine meant installing packages directly onto the host system. If that service required a specific version of Java, Python, or Node.js, it could conflict with other tools on the host. Over time, upgrading the host operating system became risky, as any system-level library change could break self-hosted services.

Containers solve this encapsulation problem entirely. Docker Compose isolates each service along with its runtime, binaries, and dependencies inside a lightweight container. 

* **Clean Host OS**: The host system remains pristine, requiring only the Docker engine and Compose. All applications run in isolation.
* **Trivial Cleanup**: Removing a service is completely clean. Deleting a few lines from a configuration file and purging its dedicated volume removes all traces of the application, leaving no orphaned packages, config files, or user accounts behind.
* **Host Port Conservation**: Instead of exposing every database, API, and internal web UI to the host network interface, services can communicate internally over virtual container networks. Ports are only exposed to the outside world when explicitly configured.

---

## Declarative Infrastructure

Docker Compose allows homelab administrators to treat their entire infrastructure as code. Instead of remembering a long sequence of imperative CLI commands (`docker run --name ... -v ... -p ...`), the entire homelab configuration is declared in a single, version-controlled YAML file.

This declarative nature yields significant benefits:

### 1. Unified Management
Instead of managing services individually, the entire stack can be managed using simple, global commands. Starting, stopping, restarting, or pulling updates for every service in the homelab becomes a single-command operation.

### 2. Simplified Backups and Migration
Because containers decouple code from state, backup strategies are greatly simplified. By mapping application directories to specific directories on the host, backing up the homelab is as simple as running a backup script on a single folder. Migrating the entire homelab to a new machine is equally trivial: copy the data directory, move the `docker-compose.yml` file, and run the container start command.

### 3. Orchestration and Order of Operations
A functional homelab has implicit dependencies—web interfaces rely on databases, and media indexers rely on VPN tunnels. Docker Compose handles these dependencies natively. Using simple declarations, Compose ensures that supporting services (like PostgreSQL database engines or VPN gateways) initialize and reach a healthy state before dependent web servers start up, preventing startup crashes.

---

## Network Isolation

By default, Docker Compose automatically creates a virtual network for each stack. Within this network, Docker runs an embedded DNS server (accessible internally at `127.0.0.11`) that enables automatic service discovery. This allows containers on the same network to resolve and communicate with each other using their service names as hostnames, completely bypassing the need to manage dynamic container IP addresses.

### Automatic Service Discovery Example

Consider a common scenario where a web application needs to communicate with a database:

```yaml
services:
  web-service:
    image: node:alpine
    container_name: web-app-container
    ports:
      - "80:8000" # Maps port 80 on the host to port 8000 inside this container
    environment:
      - DATABASE_URL=mongodb://database-container:27017/appdata
    networks:
      - backend-network

  db-service:
    image: mongo:latest
    container_name: database-container
    expose:
      - "27017" # Explicitly opens port 27017 only internally within the bridge network
    networks:
      - backend-network

networks:
  backend-network:
    driver: bridge
```

In this setup:
* **Hostname Resolution**: Docker's internal DNS dynamically registers both the service names (`web-service`, `db-service`) and the custom container names (`web-app-container`, `database-container`) as valid network hostnames. The web application inside `web-app-container` can resolve and connect directly to the database using the hostname `database-container` on port `27017`.
* **Port Mapping vs. Internal Exposure**: 
  - **Exposed Externally**: The web service defines a port mapping (`80:8000`), meaning users on the local network or internet can access the application by navigating to the host machine's IP on port `80`.
  - **Exposed Internally Only**: The database service defines `expose: - "27017"`. It does not map ports to the host machine. Port `27017` is fully unreachable from the host machine or external network, but remains open and accessible internally to any containers sharing the `backend-network`.
* **Dynamic IP Isolation**: If `database-container` restarts and receives a new internal IP (e.g., changing from `172.18.0.3` to `172.18.0.4`), the embedded DNS server automatically updates the mapping. The web app's connection string `mongodb://database-container:27017` remains valid and unbroken.

This network architecture not only enhances security by keeping databases isolated, but also prevents port conflicts. Multiple distinct Compose files can run different services on internal port `27017` or `5432` simultaneously because they reside on separate isolated networks, only mapping to host port `80` or `443` at the ingress entry point.

---

## A Frictionless Self-Hosting Experience

Ultimately, Docker Compose transforms self-hosting from a chore of manual system administration into a clean, predictable developer experience. It provides the perfect middle ground for a homelab: it avoids the massive resource overhead and operational complexity of Kubernetes, while providing far more order, automation, and structure than raw Docker commands.

By keeping the host operating system untouched and defining services declaratively, Docker Compose ensures that the homelab remains stable, secure, and incredibly easy to maintain over years of operations.
