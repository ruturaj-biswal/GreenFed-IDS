
package greenfed_resource_monitor.telemetry.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record TelemetryRequest(

    UUID experimentId,

    String agentId,

    @NotNull
    OffsetDateTime observedAt,

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    Double cpuPercent,

    @NotNull
    @PositiveOrZero
    Long memoryTotalBytes,

    @NotNull
    @PositiveOrZero
    Long memoryUsedBytes,

    @NotNull
    @PositiveOrZero
    Long memoryAvailableBytes,

    @NotNull
    String source,

    String collectionVersion

) {}
