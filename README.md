# GreenFed-IDS — Resource Monitoring Platform

GreenFed-IDS is an independent resource-monitoring project designed to collect, store and visualize system resource and network telemetry from real and simulated clients.

The current implementation includes a Node.js/Express API, PostgreSQL persistence, a real hardware monitoring agent, a simulated-client generator and a React dashboard preview. The older Spring Boot implementation is retained in the repository as a reference implementation.

> **Implementation status:** Client registration, token authentication, telemetry ingestion and PostgreSQL storage have been implemented and tested. The React dashboard currently uses clearly identified demo-preview values because dashboard read APIs and live chart integration are not yet complete.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Implemented Features](#implemented-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Run the Project](#run-the-project)
- [Dashboard Status](#dashboard-status)
- [Security Notes](#security-notes)
- [Current Limitations and Next Steps](#current-limitations-and-next-steps)

---

## Project Overview

The platform has three main data sources:

1. **Real agent:** Collects CPU, memory, disk and network information from the machine where the agent runs.
2. **Simulated clients:** Generate synthetic resource, disk and network telemetry for testing multiple clients.
3. **PostgreSQL:** Stores client registrations, credentials and telemetry samples.

The dashboard is a React-based interface intended to present monitoring information in one place.

Real measurements and generated simulated measurements must be interpreted separately. Simulated clients do not represent independent physical computers.

## Implemented Features

### Backend and client management

- Client registration through the Express API.
- Support for `real_agent` and `simulated_agent` client modes.
- Random client authentication tokens.
- SHA-256 token hashes stored in the database rather than plaintext tokens.
- Bearer-token authentication middleware.
- Client enabled, revoked and expiry checks in authentication flow.
- PostgreSQL connection through the `pg` package.

### Resource monitoring

The real agent collects:

- CPU utilization.
- Memory totals and usage.
- Disk filesystem capacity and usage.
- Network interface transfer counters and calculated bandwidth.

### Simulated monitoring

The simulator can register simulated clients and generate:

- CPU and memory telemetry.
- Disk capacity and usage telemetry.
- Network transfer and bandwidth telemetry.

The simulator sends telemetry to the Express API using the registered client's bearer token.

### Telemetry storage

Telemetry is stored in PostgreSQL tables:

- `resource_samples`
- `network_samples`
- `disk_samples`

Source labels distinguish real and simulated data. The API derives the source classification from the authenticated client's registered mode.

### Database and reference implementation

- PostgreSQL schema and Flyway migration files are retained.
- The Spring Boot implementation is retained under `server/` as a reference.
- The active Node.js/Express API is under `api/`.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Recharts, Lucide React |
| Backend API | Node.js, Express.js |
| Database | PostgreSQL |
| Database access | `pg` |
| Real monitoring agent | Node.js, systeminformation |
| Simulator | Node.js |
| Authentication | Bearer tokens, SHA-256 token hashing |
| Reference backend | Java, Spring Boot, Spring Data JPA, Flyway |
| Development tools | npm, Maven, Git, GitHub |

## Architecture

```text
                 +-----------------------+
                 |   React Dashboard     |
                 |   Vite + Recharts     |
                 +-----------+-----------+
                             |
                             | HTTP
                             v
+----------------+    +------+----------------+    +----------------+
| Real Node Agent|--->|                      |    |                |
| CPU / RAM /    |    | Node.js / Express API|--->|  PostgreSQL    |
| Disk / Network |    | Port 5000            |    | greenfed_monitor|
+----------------+    |                      |    |                |
                      +------+----------------+    +----------------+
+----------------+           ^
| Node Simulator|------------+
| Synthetic     |
| telemetry     |
+----------------+
```

The Spring Boot reference implementation is kept separately under `server/`. The current monitoring API described in this README is the Express application under `api/`.

## Repository Structure

```text
greenfed-resource-monitor/
|
|-- agent/                 # Real hardware monitoring agent
|   |-- src/collectors/    # CPU, memory, disk and network collectors
|   `-- src/services/      # API communication
|
|-- api/                   # Active Express backend
|   `-- src/
|       |-- config/        # PostgreSQL connection
|       |-- controllers/   # Client, heartbeat and telemetry handlers
|       |-- middleware/    # Authentication
|       |-- routes/        # API routes
|       `-- services/      # Client and telemetry services
|
|-- client/
|   `-- greenfed-dashboard-download/
|       |-- src/           # React dashboard
|       |-- index.html
|       `-- vite.config.js
|
|-- migrations/            # Root SQL migration placeholder
|
|-- server/                # Spring Boot reference implementation
|   `-- src/main/resources/db/migration/
|
|-- simulator/             # Simulated monitoring clients
|   `-- src/
|       |-- generators/
|       `-- services/
|
|-- .gitignore
`-- README.md
```

## Database

The configured PostgreSQL database is named `greenfed_monitor`.

The schema includes monitoring and experiment-related tables, including:

- `clients`
- `client_credentials`
- `resource_samples`
- `network_samples`
- `disk_samples`
- `experiments`
- `experiment_clients`
- `experiment_events`
- `host_samples`

The Flyway migration files currently retained in the Spring Boot reference application are:

- `V1__initial_schema.sql`
- `V2__create_monitoring_tables.sql`
- `V3__add_client_last_seen.sql`
- `V4__create_disk_samples.sql`

The database has been checked for the foreign-key relationships from `experiment_clients` and `experiment_events` to `experiments` and `clients`.

## API Endpoints

The Express application runs on port `5000` by default.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/db-health` | Database connectivity check |
| POST | `/api/clients` | Register a monitoring client |
| POST | `/api/heartbeat` | Client heartbeat route |
| POST | `/api/telemetry` | Submit resource, network and disk telemetry |

Telemetry submission requires a valid bearer token.

> Dashboard read endpoints, experiment-management endpoints and export endpoints are not documented as implemented because they have not yet been verified in the current Express API.

## Prerequisites

Install the following:

- Node.js and npm.
- PostgreSQL.
- Git.
- Java and Maven only if you intend to run the Spring Boot reference implementation.

## Local Setup

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd greenfed-resource-monitor
```

### 1. Configure the Express API

```bash
cd api
npm install
```

Create `api/.env` locally. Do not commit this file.

Example configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenfed_monitor
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_DATABASE_PASSWORD
PORT=5000
```

Use the actual environment variable names expected by `api/src/config/db.js` and `api/src/server.js`. Keep real credentials only in your local environment.

Start the API:

```bash
npm run dev
```

If the project does not define a `dev` script, use:

```bash
npm start
```

Check:

- `http://localhost:5000/api/health`
- `http://localhost:5000/api/db-health`

### 2. Run the real monitoring agent

Open another terminal:

```bash
cd agent
npm install
```

Configure the agent's local environment file with the API URL and the registered agent token, using the variable names expected by `agent/src/index.js` and its API service.

Start the agent using the script defined in `agent/package.json`:

```bash
npm start
```

### 3. Run the simulator

Open another terminal:

```bash
cd simulator
npm install
```

Copy `.env.example` to `.env` if required and configure the API URL and simulator settings.

Start the simulator:

```bash
npm start
```

The simulator registers clients when it starts. Repeated starts may create additional client registrations in the current implementation.

### 4. Run the React dashboard

Open another terminal:

```bash
cd client/greenfed-dashboard-download
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

## Dashboard Status

The dashboard currently provides a responsive dark-themed UI with:

- Overview metric cards.
- CPU, memory and disk charts.
- Network performance chart.
- Client monitoring table and client search.
- Active experiment preview section.
- Recent activity preview.
- Responsive sidebar navigation.

**Current data status:** Dashboard cards, charts, client rows, experiments and activity currently use local demo-preview data. The frontend attempts to call `GET /api/dashboard/overview` and `GET /api/clients`, but those read endpoints have not been verified as implemented in the Express backend. The dashboard therefore must not be treated as a live monitoring view yet.

## Security Notes

- Never commit `.env` files, passwords, access tokens or private credentials.
- The `.env.example` files should contain placeholders only.
- Client tokens are returned at registration and should be handled as secrets.
- The API stores token hashes, not the original token values.
- Restrict CORS and use HTTPS before exposing the API outside a trusted local development environment.
- Rotate any credential that has been exposed.

## Current Limitations and Next Steps

The following work remains before the platform can be considered fully integrated:

1. Implement dashboard read APIs for clients and telemetry aggregates.
2. Connect the React charts and metric cards to actual PostgreSQL data.
3. Add experiment-management APIs and associate telemetry with experiments.
4. Complete heartbeat integration for the real agent.
5. Improve simulator client reuse to avoid duplicate registrations on each start.
6. Add CSV and JSON export endpoints.
7. Add automated backend and frontend tests.
8. Complete deployment configuration and final project documentation/screenshots.

---

## Project Status Summary

| Component | Current status |
|---|---|
| PostgreSQL connectivity and schema | Implemented and checked |
| Express API health and DB health | Tested |
| Client registration and authentication | Implemented |
| Real resource agent | Implemented and tested |
| Simulated telemetry generation | Implemented and tested |
| Resource, network and disk storage | Tested |
| React dashboard UI | Created; demo-preview data |
| Dashboard live data integration | Pending |
| Experiment API workflow | Pending |
| Exports and automated tests | Pending |

---

**GreenFed-IDS — Independent Resource Monitoring Platform**
