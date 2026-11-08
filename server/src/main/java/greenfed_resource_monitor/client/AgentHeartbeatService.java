
package greenfed_resource_monitor.client;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AgentHeartbeatService {

    private final ClientCredentialRepository credentialRepository;
    private final ClientRepository clientRepository;

    public AgentHeartbeatService(
            ClientCredentialRepository credentialRepository,
            ClientRepository clientRepository) {
        this.credentialRepository = credentialRepository;
        this.clientRepository = clientRepository;
    }

    @Transactional
    public HeartbeatResponse heartbeat(String token) {
        if (token == null || token.isBlank()) {
            throw unauthorized();
        }

        String tokenHash = hashToken(token);

        ClientCredential credential =
            credentialRepository.findByTokenHash(tokenHash)
                .orElseThrow(this::unauthorized);

        OffsetDateTime now = OffsetDateTime.now();

        if (credential.getRevokedAt() != null) {
            throw unauthorized();
        }

        if (credential.getExpiresAt() != null
                && !credential.getExpiresAt().isAfter(now)) {
            throw unauthorized();
        }

        Client client = clientRepository.findById(
                credential.getClient().getClientId())
            .orElseThrow(this::unauthorized);

        if (!client.isEnabled()) {
            throw unauthorized();
        }

        client.setLastSeenAt(now);
        credential.setLastUsedAt(now);

        clientRepository.save(client);
        credentialRepository.save(credential);

        return new HeartbeatResponse(
            "ok",
            client.getClientId(),
            now
        );
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException(
                "SHA-256 is unavailable", ex
            );
        }
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid or inactive agent credential"
        );
    }
}
