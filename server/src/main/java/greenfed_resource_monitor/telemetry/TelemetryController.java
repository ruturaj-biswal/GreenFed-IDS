
package greenfed_resource_monitor.telemetry;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import greenfed_resource_monitor.telemetry.dto.TelemetryRequest;
import greenfed_resource_monitor.telemetry.dto.TelemetryResponse;

@RestController
@RequestMapping("/api/agent")
public class TelemetryController {

    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @PostMapping("/telemetry")
    @ResponseStatus(HttpStatus.CREATED)
    public TelemetryResponse submitTelemetry(
            @RequestHeader(
                name = "Authorization",
                required = false
            ) String authorization,
            @RequestBody TelemetryRequest request) {

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bearer token required");
        }

        String token = authorization.substring(7).trim();

        return telemetryService.record(token, request);
    }
}
