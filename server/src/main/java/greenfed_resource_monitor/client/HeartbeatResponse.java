
package greenfed_resource_monitor.client;

import java.time.OffsetDateTime;
import java.util.UUID;

public record HeartbeatResponse(
    String status,
    UUID clientId,
    OffsetDateTime lastSeenAt
) {
}
