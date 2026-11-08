
ALTER TABLE clients
ADD COLUMN last_seen_at TIMESTAMPTZ;

CREATE INDEX idx_clients_last_seen_at
ON clients (last_seen_at);
