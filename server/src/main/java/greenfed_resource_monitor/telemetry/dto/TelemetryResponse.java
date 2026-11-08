
package greenfed_resource_monitor.telemetry.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TelemetryResponse(
    Long sampleId,
    UUID clientId,
    UUID experimentId,
    OffsetDateTime observedAt,
    Double cpuPercent,
    Long memoryTotalBytes,
    Long memoryUsedBytes,
    Long memoryAvailableBytes,
    String source
) {}
