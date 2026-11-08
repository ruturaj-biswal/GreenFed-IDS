
package greenfed_resource_monitor.client;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateClientResponse(
    UUID clientId,
    String displayName,
    String agentMode,
    boolean enabled,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    String agentToken
) {
}
