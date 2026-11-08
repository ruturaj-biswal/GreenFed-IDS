
CREATE TABLE clients (
    client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(120) NOT NULL,
    agent_mode VARCHAR(30) NOT NULL
        CHECK (agent_mode IN ('real_agent', 'simulated_agent')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_credentials (
    credential_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(client_id),
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
);

CREATE TABLE experiments (
    experiment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'running', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_by TEXT
);

CREATE TABLE experiment_clients (
    experiment_id UUID NOT NULL REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(client_id),
    assignment_status VARCHAR(20) NOT NULL DEFAULT 'assigned'
        CHECK (assignment_status IN ('assigned', 'active', 'completed', 'failed')),
    joined_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    PRIMARY KEY (experiment_id, client_id)
);

CREATE TABLE host_samples (
    sample_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    experiment_id UUID REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    host_id TEXT NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    cpu_percent DOUBLE PRECISION CHECK (cpu_percent BETWEEN 0 AND 100),
    memory_total_bytes BIGINT CHECK (memory_total_bytes >= 0),
    memory_used_bytes BIGINT CHECK (memory_used_bytes >= 0),
    memory_available_bytes BIGINT CHECK (memory_available_bytes >= 0),
    source VARCHAR(30) NOT NULL DEFAULT 'measured_host'
        CHECK (source IN ('measured_host', 'measured_client', 'measured_network', 'simulated', 'estimated', 'unavailable')),
    collection_version TEXT
);

CREATE TABLE resource_samples (
    sample_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    experiment_id UUID REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(client_id),
    agent_id TEXT,
    observed_at TIMESTAMPTZ NOT NULL,
    cpu_percent DOUBLE PRECISION CHECK (cpu_percent BETWEEN 0 AND 100),
    memory_total_bytes BIGINT CHECK (memory_total_bytes >= 0),
    memory_used_bytes BIGINT CHECK (memory_used_bytes >= 0),
    memory_available_bytes BIGINT CHECK (memory_available_bytes >= 0),
    source VARCHAR(30) NOT NULL
        CHECK (source IN ('measured_client', 'simulated', 'estimated', 'unavailable')),
    collection_version TEXT
);

CREATE TABLE network_samples (
    sample_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    experiment_id UUID REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(client_id),
    observed_at TIMESTAMPTZ NOT NULL,
    latency_ms DOUBLE PRECISION CHECK (latency_ms >= 0),
    transfer_bytes BIGINT CHECK (transfer_bytes >= 0),
    duration_ms DOUBLE PRECISION CHECK (duration_ms >= 0),
    bandwidth_mbps DOUBLE PRECISION CHECK (bandwidth_mbps >= 0),
    jitter_ms DOUBLE PRECISION CHECK (jitter_ms >= 0),
    packet_loss_percent DOUBLE PRECISION CHECK (packet_loss_percent BETWEEN 0 AND 100),
    source VARCHAR(30) NOT NULL
        CHECK (source IN ('measured_network', 'simulated', 'estimated', 'unavailable')),
    method TEXT
);

CREATE TABLE experiment_events (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    experiment_id UUID REFERENCES experiments(experiment_id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(client_id),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (severity IN ('info', 'warning', 'error')),
    event_type VARCHAR(80) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_host_samples_experiment_time
    ON host_samples (experiment_id, observed_at);

CREATE INDEX idx_resource_samples_experiment_time
    ON resource_samples (experiment_id, observed_at);

CREATE INDEX idx_resource_samples_client_time
    ON resource_samples (client_id, observed_at);

CREATE INDEX idx_network_samples_experiment_time
    ON network_samples (experiment_id, observed_at);

CREATE INDEX idx_network_samples_client_time
    ON network_samples (client_id, observed_at);

CREATE INDEX idx_experiments_status_created
    ON experiments (status, created_at DESC);

CREATE INDEX idx_clients_enabled ON clients (enabled);

CREATE INDEX idx_experiment_events_time
    ON experiment_events (experiment_id, occurred_at);
