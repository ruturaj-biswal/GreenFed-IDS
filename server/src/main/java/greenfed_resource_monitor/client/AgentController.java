
package greenfed_resource_monitor.client;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final AgentHeartbeatService heartbeatService;

    public AgentController(AgentHeartbeatService heartbeatService) {
        this.heartbeatService = heartbeatService;
    }

    @PostMapping("/heartbeat")
    @ResponseStatus(HttpStatus.OK)
    public HeartbeatResponse heartbeat(
            @RequestHeader(
                name = "Authorization",
                required = false
            ) String authorization) {

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Bearer token required"
            );
        }

        String token = authorization.substring(7).trim();

        return heartbeatService.heartbeat(token);
    }
}
