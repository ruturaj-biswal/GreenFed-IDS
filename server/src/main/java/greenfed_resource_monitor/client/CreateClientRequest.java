
package greenfed_resource_monitor.client;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateClientRequest(

    @NotBlank(message = "Display name is required")
    @Size(max = 120, message = "Display name cannot exceed 120 characters")
    String displayName,

    @NotBlank(message = "Agent mode is required")
    @Pattern(
        regexp = "real_agent|simulated_agent",
        message = "Agent mode must be real_agent or simulated_agent"
    )
    String agentMode

) {}
