
CREATE TABLE IF NOT EXISTS disk_samples (
    sample_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    experiment_id UUID REFERENCES experiments(experiment_id)
        ON DELETE CASCADE,

    client_id UUID NOT NULL REFERENCES clients(client_id),

    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    filesystem TEXT,
    mount TEXT,

    total_bytes BIGINT,
    used_bytes BIGINT,
    available_bytes BIGINT,

    used_percent DOUBLE PRECISION,

    source VARCHAR(30) NOT NULL DEFAULT 'measured_client',

    collection_version TEXT,

    CONSTRAINT disk_samples_total_check
        CHECK (total_bytes IS NULL OR total_bytes >= 0),

    CONSTRAINT disk_samples_used_check
        CHECK (used_bytes IS NULL OR used_bytes >= 0),

    CONSTRAINT disk_samples_available_check
        CHECK (available_bytes IS NULL OR available_bytes >= 0),

    CONSTRAINT disk_samples_percent_check
        CHECK (used_percent IS NULL OR
               (used_percent >= 0 AND used_percent <= 100)),

    CONSTRAINT disk_samples_source_check
        CHECK (source IN ('measured_client', 'simulated', 'estimated', 'unavailable'))
);

CREATE INDEX idx_disk_samples_client_time
    ON disk_samples(client_id, observed_at);

CREATE INDEX idx_disk_samples_experiment_time
    ON disk_samples(experiment_id, observed_at);
