
package greenfed_resource_monitor.telemetry;

import java.time.OffsetDateTime;
import java.util.UUID;

import greenfed_resource_monitor.client.Client;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "resource_samples")
public class ResourceSample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sample_id")
    private Long sampleId;

    @Column(name = "experiment_id")
    private UUID experimentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "agent_id")
    private String agentId;

    @Column(name = "observed_at", nullable = false)
    private OffsetDateTime observedAt;

    @Column(name = "cpu_percent")
    private Double cpuPercent;

    @Column(name = "memory_total_bytes")
    private Long memoryTotalBytes;

    @Column(name = "memory_used_bytes")
    private Long memoryUsedBytes;

    @Column(name = "memory_available_bytes")
    private Long memoryAvailableBytes;

    @Column(name = "source", nullable = false, length = 30)
    private String source;

    @Column(name = "collection_version")
    private String collectionVersion;

    protected ResourceSample() {
    }

    public ResourceSample(
            Client client,
            OffsetDateTime observedAt,
            Double cpuPercent,
            Long memoryTotalBytes,
            Long memoryUsedBytes,
            Long memoryAvailableBytes,
            String source) {
        this.client = client;
        this.observedAt = observedAt;
        this.cpuPercent = cpuPercent;
        this.memoryTotalBytes = memoryTotalBytes;
        this.memoryUsedBytes = memoryUsedBytes;
        this.memoryAvailableBytes = memoryAvailableBytes;
        this.source = source;
    }

    public Long getSampleId() {
        return sampleId;
    }

    public UUID getExperimentId() {
        return experimentId;
    }

    public void setExperimentId(UUID experimentId) {
        this.experimentId = experimentId;
    }

    public Client getClient() {
        return client;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public OffsetDateTime getObservedAt() {
        return observedAt;
    }

    public Double getCpuPercent() {
        return cpuPercent;
    }

    public Long getMemoryTotalBytes() {
        return memoryTotalBytes;
    }

    public Long getMemoryUsedBytes() {
        return memoryUsedBytes;
    }

    public Long getMemoryAvailableBytes() {
        return memoryAvailableBytes;
    }

    public String getSource() {
        return source;
    }

    public String getCollectionVersion() {
        return collectionVersion;
    }

    public void setCollectionVersion(String collectionVersion) {
        this.collectionVersion = collectionVersion;
    }
}
