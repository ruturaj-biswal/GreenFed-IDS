# GreenFed-IDS Dashboard

A responsive React + Vite monitoring dashboard for the GreenFed-IDS resource-monitoring project.

## Included
- Dark professional dashboard UI
- CPU, memory, disk and network charts (Recharts)
- Client monitoring table with search
- Experiment overview and recent activity panels
- Responsive sidebar and mobile layout
- API proxy to `http://localhost:5000`
- Demo preview data when dashboard read endpoints are not yet available

## Run locally

From this folder:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Current API integration status

The existing project backend has telemetry ingestion and client registration. This dashboard optionally attempts:

- `GET /api/dashboard/overview`
- `GET /api/clients`

The `/api/dashboard/overview` read endpoint and a `GET /api/clients` endpoint were not confirmed as implemented in the existing backend. Until those endpoints return the documented data, the UI intentionally stays in **DEMO PREVIEW** mode. It does not present sample chart values as live measurements.

### Expected overview response

```json
{
  "success": true,
  "data": {
    "totalClients": 14,
    "activeClients": 9,
    "runningExperiments": 2,
    "samplesToday": 1284,
    "avgCpu": 48.6,
    "avgMemory": 63.2,
    "avgDisk": 57.8,
    "avgLatency": 24.7,
    "packetLoss": 0.3
  }
}
```

### Expected clients response

```json
{
  "success": true,
  "data": [
    {
      "client_id": "uuid",
      "display_name": "Workstation Alpha",
      "agent_mode": "real_agent",
      "enabled": true,
      "cpu_percent": 42,
      "memory_percent": 61
    }
  ]
}
```

For production-quality live charts, add a time-series read endpoint and bind the Recharts series to its returned samples. The included charts are clearly demo-preview values until that endpoint is connected.

## Build check

```powershell
npm run build
```
