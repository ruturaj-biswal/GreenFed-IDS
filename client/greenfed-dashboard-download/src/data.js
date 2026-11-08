export const demoOverview = {
  totalClients: 14,
  activeClients: 9,
  runningExperiments: 2,
  samplesToday: 1284,
  avgCpu: 48.6,
  avgMemory: 63.2,
  avgDisk: 57.8,
  avgLatency: 24.7,
  packetLoss: 0.3
};

export const resourceSeries = [
  { time: "09:00", cpu: 32, memory: 48, disk: 54 },
  { time: "09:10", cpu: 38, memory: 51, disk: 54 },
  { time: "09:20", cpu: 44, memory: 53, disk: 55 },
  { time: "09:30", cpu: 39, memory: 56, disk: 55 },
  { time: "09:40", cpu: 52, memory: 59, disk: 56 },
  { time: "09:50", cpu: 47, memory: 61, disk: 56 },
  { time: "10:00", cpu: 58, memory: 64, disk: 57 },
  { time: "10:10", cpu: 49, memory: 63, disk: 58 },
  { time: "10:20", cpu: 55, memory: 66, disk: 58 },
  { time: "10:30", cpu: 43, memory: 63, disk: 58 },
  { time: "10:40", cpu: 46, memory: 62, disk: 58 },
  { time: "10:50", cpu: 51, memory: 63, disk: 58 }
];

export const networkSeries = [
  { time: "09:00", inbound: 18, outbound: 11, latency: 21 },
  { time: "09:10", inbound: 24, outbound: 15, latency: 23 },
  { time: "09:20", inbound: 21, outbound: 13, latency: 22 },
  { time: "09:30", inbound: 31, outbound: 19, latency: 28 },
  { time: "09:40", inbound: 27, outbound: 17, latency: 25 },
  { time: "09:50", inbound: 36, outbound: 22, latency: 29 },
  { time: "10:00", inbound: 29, outbound: 18, latency: 24 },
  { time: "10:10", inbound: 42, outbound: 26, latency: 31 },
  { time: "10:20", inbound: 35, outbound: 21, latency: 27 },
  { time: "10:30", inbound: 32, outbound: 20, latency: 25 },
  { time: "10:40", inbound: 39, outbound: 24, latency: 26 },
  { time: "10:50", inbound: 34, outbound: 22, latency: 24 }
];

export const clients = [
  { id: "GF-001", name: "Workstation Alpha", mode: "Real agent", status: "Online", cpu: 42, memory: 61, source: "Measured" },
  { id: "GF-002", name: "Simulation Node 01", mode: "Simulated", status: "Online", cpu: 67, memory: 72, source: "Simulated" },
  { id: "GF-003", name: "Workstation Beta", mode: "Real agent", status: "Online", cpu: 28, memory: 49, source: "Measured" },
  { id: "GF-004", name: "Simulation Node 02", mode: "Simulated", status: "Offline", cpu: 0, memory: 0, source: "Simulated" },
  { id: "GF-005", name: "Build Server", mode: "Real agent", status: "Online", cpu: 81, memory: 78, source: "Measured" }
];

export const activities = [
  { type: "success", title: "Telemetry received", detail: "Workstation Alpha · CPU, memory and disk samples", time: "Just now" },
  { type: "info", title: "Experiment started", detail: "Network Stability — 4 clients assigned", time: "8 min ago" },
  { type: "warning", title: "High CPU utilization", detail: "Build Server reported 81% CPU usage", time: "14 min ago" },
  { type: "success", title: "Client connected", detail: "Simulation Node 02 registered successfully", time: "22 min ago" }
];
