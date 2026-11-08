
package greenfed_resource_monitor.telemetry;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import greenfed_resource_monitor.client.Client;
import greenfed_resource_monitor.client.ClientCredential;
import greenfed_resource_monitor.client.ClientCredentialRepository;
import greenfed_resource_monitor.client.ClientRepository;
import greenfed_resource_monitor.telemetry.dto.TelemetryRequest;
import greenfed_resource_monitor.telemetry.dto.TelemetryResponse;

@Service
public class TelemetryService {

    private final ClientCredentialRepository credentialRepository;
    private final ClientRepository clientRepository;
    private final ResourceSampleRepository sampleRepository;

    public TelemetryService(
            ClientCredentialRepository credentialRepository,
            ClientRepository clientRepository,
            ResourceSampleRepository sampleRepository) {
        this.credentialRepository = credentialRepository;
        this.clientRepository = clientRepository;
        this.sampleRepository = sampleRepository;
    }

    @Transactional
    public TelemetryResponse record(String token, TelemetryRequest request) {
        if (token == null || token.isBlank()) {
            throw unauthorized();
        }

        String tokenHash = hashToken(token);

        ClientCredential credential = credentialRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(this::unauthorized);

        OffsetDateTime now = OffsetDateTime.now();

        if (credential.getRevokedAt() != null
                || (credential.getExpiresAt() != null
                    && !credential.getExpiresAt().isAfter(now))) {
            throw unauthorized();
        }

        Client client = clientRepository.findById(
                credential.getClient().getClientId())
                .orElseThrow(this::unauthorized);

        if (!client.isEnabled()) {
            throw unauthorized();
        }

        validate(request);

        ResourceSample sample = new ResourceSample(
                client,
                request.observedAt(),
                request.cpuPercent(),
                request.memoryTotalBytes(),
                request.memoryUsedBytes(),
                request.memoryAvailableBytes(),
                request.source());

        sample.setExperimentId(request.experimentId());
        sample.setAgentId(request.agentId());
        sample.setCollectionVersion(request.collectionVersion());

        ResourceSample saved = sampleRepository.save(sample);

        client.setLastSeenAt(now);
        credential.setLastUsedAt(now);

        clientRepository.save(client);
        credentialRepository.save(credential);

        return new TelemetryResponse(
                saved.getSampleId(),
                client.getClientId(),
                saved.getExperimentId(),
                saved.getObservedAt(),
                saved.getCpuPercent(),
                saved.getMemoryTotalBytes(),
                saved.getMemoryUsedBytes(),
                saved.getMemoryAvailableBytes(),
                saved.getSource());
    }

    private void validate(TelemetryRequest request) {
        if (request == null
                || request.observedAt() == null
                || request.cpuPercent() == null
                || request.memoryTotalBytes() == null
                || request.memoryUsedBytes() == null
                || request.memoryAvailableBytes() == null
                || request.source() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Required telemetry fields are missing");
        }

        if (request.cpuPercent() < 0 || request.cpuPercent() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "CPU must be between 0 and 100");
        }

        if (request.memoryTotalBytes() < 0
                || request.memoryUsedBytes() < 0
                || request.memoryAvailableBytes() < 0
                || request.memoryUsedBytes() > request.memoryTotalBytes()
                || request.memoryAvailableBytes() > request.memoryTotalBytes()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Memory values are invalid");
        }

        if (!request.source().equals("simulated")
                && !request.source().equals("measured_client")
                && !request.source().equals("estimated")
                && !request.source().equals("unavailable")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported telemetry source");
        }
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid or inactive agent credential");
    }
}
