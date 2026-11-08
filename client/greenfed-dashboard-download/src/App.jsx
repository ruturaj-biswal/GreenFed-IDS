import { useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, ChevronDown, CircleHelp, Cpu, Database, Download,
  Gauge, HardDrive, LayoutDashboard, Menu, Network, RefreshCw,
  Search, Server, Settings, ShieldCheck, Signal, Users, Wifi, X,
  ArrowUpRight, ArrowDownRight, Clock3, PlayCircle, Monitor
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import axios from "axios";
import { activities, clients as demoClients, demoOverview, networkSeries, resourceSeries } from "./data";

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Clients", icon: Monitor },
  { label: "Experiments", icon: PlayCircle },
  { label: "Resource metrics", icon: Gauge },
  { label: "Network", icon: Network }
];

function MetricCard({ title, value, unit, change, icon: Icon, tone = "blue", foot }) {
  return <article className="metric-card">
    <div className="metric-top"><span>{title}</span><span className={`metric-icon ${tone}`}><Icon size={18}/></span></div>
    <div className="metric-value">{value}<small>{unit}</small></div>
    <div className="metric-foot"><span className={change?.startsWith("+") ? "positive" : "neutral"}>{change}</span><span>{foot}</span></div>
  </article>;
}

function PanelTitle({ title, subtitle, action }) {
  return <div className="panel-title"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

function App() {
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [overview, setOverview] = useState(demoOverview);
  const [clientRows, setClientRows] = useState(demoClients);
  const [live, setLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Optional live integration. Demo data remains visible until matching read APIs exist.
  async function refresh() {
    try {
      const [summaryRes, clientsRes] = await Promise.all([
        axios.get("/api/dashboard/overview", { timeout: 2500 }),
        axios.get("/api/clients", { timeout: 2500 })
      ]);
      const summary = summaryRes.data?.data ?? summaryRes.data;
      const rows = clientsRes.data?.data ?? clientsRes.data;
      if (summary && typeof summary.totalClients === "number") setOverview(summary);
      if (Array.isArray(rows)) setClientRows(rows.map((c) => ({
        id: c.client_id, name: c.display_name, mode: c.agent_mode === "real_agent" ? "Real agent" : "Simulated",
        status: c.enabled ? "Online" : "Offline", cpu: c.cpu_percent ?? 0,
        memory: c.memory_percent ?? 0, source: c.agent_mode === "real_agent" ? "Measured" : "Simulated"
      })));
      setLive(true);
    } catch {
      setLive(false);
    }
    setLastUpdated(new Date());
  }

  useEffect(() => { refresh(); }, []);
  const filteredClients = useMemo(() => clientRows.filter(c =>
    `${c.name} ${c.id} ${c.mode}`.toLowerCase().includes(query.toLowerCase())
  ), [clientRows, query]);

  const heading = active === "Overview" ? "Monitoring overview" : active;
  return <div className="app-shell">
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={21}/></div>
        <div><strong>GreenFed<span>-IDS</span></strong><small>RESOURCE MONITOR</small></div>
        <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button>
      </div>
      <div className="workspace"><div className="workspace-icon"><ShieldCheck size={17}/></div><div><b>Monitoring workspace</b><small>Local environment</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${active === item.label ? "selected" : ""}`} onClick={() => { setActive(item.label); setMobileOpen(false); }}><item.icon size={18}/><span>{item.label}</span>{item.label === "Experiments" && <span className="nav-count">2</span>}</button>)}</nav>
      <div className="nav-label lower">PREFERENCES</div>
      <nav>
        <button className="nav-item" onClick={() => setActive("Settings")}><Settings size={18}/><span>Settings</span></button>
        <button className="nav-item" onClick={() => setActive("Help & support")}><CircleHelp size={18}/><span>Help & support</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="system-status"><span className="pulse-dot"/><div><b>Monitoring service</b><small>API connection {live ? "connected" : "not connected"}</small></div></div><div className="user-row"><div className="avatar">GF</div><div><b>Project Admin</b><small>Administrator</small></div><ChevronDown size={15}/></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="top-left"><button className="menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div></div>
        <div className="top-actions"><div className="environment"><span className="pulse-dot"/>{live ? "LIVE DATA" : "DEMO PREVIEW"}</div><button className="icon-button" title="Refresh data" onClick={refresh}><RefreshCw size={17}/></button><button className="icon-button notification" title="Notifications"><Bell size={17}/><i/></button><div className="top-avatar">GF</div></div>
      </header>

      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">SYSTEM PERFORMANCE</div><h1>{heading}</h1><p>Monitor infrastructure health, client activity and network performance.</p></div><div className="heading-actions"><span className="updated"><Clock3 size={14}/> Updated {lastUpdated.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</span><button className="btn-secondary" onClick={refresh}><RefreshCw size={15}/> Refresh</button><button className="btn-primary" onClick={() => setActive("Experiments")}><PlayCircle size={16}/> View experiments</button></div></div>

        {active === "Overview" || active === "Resource metrics" ? <>
          <section className="metric-grid">
            <MetricCard title="Total clients" value={overview.totalClients} unit="" change="+2 this week" foot="Registered agents" icon={Users} tone="blue"/>
            <MetricCard title="Active clients" value={overview.activeClients} unit="" change="Live connections" foot="Currently reporting" icon={Wifi} tone="green"/>
            <MetricCard title="Running experiments" value={overview.runningExperiments} unit="" change="In progress" foot="Active monitoring runs" icon={Activity} tone="purple"/>
            <MetricCard title="Samples collected" value={Number(overview.samplesToday).toLocaleString()} unit="" change="+12.8%" foot="Telemetry samples today" icon={Database} tone="orange"/>
          </section>

          <section className="chart-grid">
            <article className="panel resource-panel">
              <PanelTitle title="Resource utilization" subtitle="System-wide average · Last 2 hours" action={<button className="select-control">Last 2 hours <ChevronDown size={14}/></button>}/>
              <div className="legend"><span><i className="legend-dot cpu"/>CPU</span><span><i className="legend-dot memory"/>Memory</span><span><i className="legend-dot disk"/>Disk</span></div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={resourceSeries} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b8cff" stopOpacity={0.22}/><stop offset="95%" stopColor="#5b8cff" stopOpacity={0}/></linearGradient><linearGradient id="memFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#20c997" stopOpacity={0.16}/><stop offset="95%" stopColor="#20c997" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#202a3c" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="time" tick={{fill:"#7f8ba3",fontSize:11}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:"#7f8ba3",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#121b2b",border:"1px solid #29364b",borderRadius:10,color:"#eaf0fa"}}/><Area type="monotone" dataKey="cpu" name="CPU" stroke="#5b8cff" strokeWidth={2.4} fill="url(#cpuFill)"/><Area type="monotone" dataKey="memory" name="Memory" stroke="#20c997" strokeWidth={2.2} fill="url(#memFill)"/><Line type="monotone" dataKey="disk" name="Disk" stroke="#b18cff" strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer></div>
              <div className="resource-summary"><div><span>Average CPU</span><b>{overview.avgCpu}%</b></div><div><span>Average memory</span><b>{overview.avgMemory}%</b></div><div><span>Average disk</span><b>{overview.avgDisk}%</b></div></div>
            </article>

            <article className="panel health-panel">
              <PanelTitle title="Infrastructure health" subtitle="Current resource snapshot"/>
              <div className="health-list">
                <HealthRow icon={Cpu} title="CPU utilization" value={overview.avgCpu} color="blue"/>
                <HealthRow icon={Database} title="Memory utilization" value={overview.avgMemory} color="green"/>
                <HealthRow icon={HardDrive} title="Disk utilization" value={overview.avgDisk} color="purple"/>
              </div>
              <div className="health-note"><div className="health-note-icon"><ShieldCheck size={17}/></div><div><b>Monitoring is operational</b><p>Resource telemetry pipeline is ready to receive agent samples.</p></div></div>
            </article>
          </section>
        </> : null}

        {active === "Overview" || active === "Network" ? <section className="panel network-panel">
          <PanelTitle title="Network performance" subtitle="Traffic throughput · Last 2 hours" action={<div className="network-kpis"><span><b>{overview.avgLatency} ms</b><small>Avg. latency</small></span><span><b>{overview.packetLoss}%</b><small>Packet loss</small></span></div>}/>
          <div className="legend"><span><i className="legend-dot inbound"/>Inbound</span><span><i className="legend-dot outbound"/>Outbound</span></div>
          <div className="network-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={networkSeries} margin={{top:10,right:10,left:-18,bottom:0}}><CartesianGrid stroke="#202a3c" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="time" tick={{fill:"#7f8ba3",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#7f8ba3",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#121b2b",border:"1px solid #29364b",borderRadius:10,color:"#eaf0fa"}}/><Line type="monotone" dataKey="inbound" name="Inbound Mbps" stroke="#5b8cff" strokeWidth={2.4} dot={false}/><Line type="monotone" dataKey="outbound" name="Outbound Mbps" stroke="#20c997" strokeWidth={2.4} dot={false}/></LineChart></ResponsiveContainer></div>
        </section> : null}

        {active === "Overview" || active === "Clients" ? <section className="panel clients-panel">
          <PanelTitle title="Client monitoring" subtitle="Registered monitoring agents and their latest reported state" action={<button className="btn-secondary small" onClick={() => setActive("Clients")}>View all clients <ArrowUpRight size={14}/></button>}/>
          <div className="table-toolbar"><div className="search-box"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clients..."/></div><div className="table-meta"><span className="status-key"><i className="online-dot"/>Online</span><span className="status-key"><i className="offline-dot"/>Offline</span></div></div>
          <div className="table-scroll"><table><thead><tr><th>CLIENT</th><th>TYPE</th><th>STATUS</th><th>CPU</th><th>MEMORY</th><th>DATA SOURCE</th></tr></thead><tbody>
            {filteredClients.slice(0, active === "Clients" ? 20 : 5).map((c, i) => <tr key={c.id || i}><td><div className="client-name"><div className={`client-avatar avatar-${i%4}`}><Monitor size={15}/></div><div><b>{c.name}</b><small>{c.id}</small></div></div></td><td><span className={`type-pill ${c.mode === "Simulated" ? "sim" : "real"}`}>{c.mode}</span></td><td><span className={`status-pill ${c.status === "Online" ? "online" : "offline"}`}><i/>{c.status}</span></td><td><b>{c.cpu}%</b></td><td><b>{c.memory}%</b></td><td><span className="source-label">{c.source}</span></td></tr>)}
          </tbody></table>{filteredClients.length === 0 && <div className="empty-state">No clients match your search.</div>}</div>
          <div className="table-footer">Showing {Math.min(filteredClients.length, active === "Clients" ? 20 : 5)} of {filteredClients.length} clients <span>Data source labels distinguish measured and simulated telemetry.</span></div>
        </section> : null}

        {active === "Overview" || active === "Experiments" ? <section className="bottom-grid">
          <article className="panel experiments-panel"><PanelTitle title="Active experiments" subtitle="Current monitoring sessions" action={<span className="subtle-link">Experiment overview <ArrowUpRight size={13}/></span>}/>
            <div className="experiment-item"><div className="experiment-icon purple-bg"><Activity size={17}/></div><div className="experiment-info"><b>Network Stability Analysis</b><small>4 clients · Started 10:12 AM</small><div className="progress"><i style={{width:"68%"}}/></div></div><span className="running-tag">Running</span></div>
            <div className="experiment-item"><div className="experiment-icon blue-bg"><Gauge size={17}/></div><div className="experiment-info"><b>Resource Utilization Test</b><small>3 clients · Started 09:45 AM</small><div className="progress"><i className="progress-green" style={{width:"42%"}}/></div></div><span className="running-tag">Running</span></div>
          </article>
          <article className="panel activity-panel"><PanelTitle title="Recent activity" subtitle="Latest system events"/>
            <div className="activity-list">{activities.map((a,i)=><div className="activity-item" key={i}><div className={`activity-marker ${a.type}`}/><div><b>{a.title}</b><p>{a.detail}</p><small>{a.time}</small></div></div>)}</div>
          </article>
        </section> : null}

        {active !== "Overview" && !["Clients","Experiments","Resource metrics","Network","Settings","Help & support"].includes(active) ? <div className="panel empty-page">Select a workspace section to continue.</div> : null}
        {["Settings","Help & support"].includes(active) ? <div className="panel empty-page"><div className="empty-icon"><Settings size={22}/></div><h3>{active}</h3><p>This section can be configured as a later enhancement.</p></div> : null}
        <footer className="footer"><span>© 2026 GreenFed-IDS · Resource Monitoring Platform</span><span><span className="pulse-dot"/> System status: {live ? "Connected" : "Preview mode"}</span></footer>
      </div>
    </main>
  </div>;
}

function HealthRow({icon: Icon, title, value, color}) {
  return <div className="health-row"><div className={`health-icon ${color}`}><Icon size={17}/></div><div className="health-content"><div><span>{title}</span><b>{value}%</b></div><div className="meter"><i className={color} style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div></div></div>;
}

export default App;
