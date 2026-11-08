
package greenfed_resource_monitor.client;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientCredentialRepository credentialRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public ClientService(
            ClientRepository clientRepository,
            ClientCredentialRepository credentialRepository) {
        this.clientRepository = clientRepository;
        this.credentialRepository = credentialRepository;
    }

    @Transactional
    public CreateClientResponse createClient(CreateClientRequest request) {
        Client client = new Client(
            request.displayName().trim(),
            request.agentMode()
        );

        client = clientRepository.save(client);

        String rawToken = generateToken();
        String tokenHash = hashToken(rawToken);

        ClientCredential credential =
            new ClientCredential(client, tokenHash);

        credentialRepository.save(credential);

        return new CreateClientResponse(
            client.getClientId(),
            client.getDisplayName(),
            client.getAgentMode(),
            client.isEnabled(),
            client.getCreatedAt(),
            client.getUpdatedAt(),
            rawToken
        );
    }

    @Transactional(readOnly = true)
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Client getClientById(UUID id) {
        return clientRepository.findById(id)
            .orElseThrow(() ->
                new ClientNotFoundException("Client not found: " + id)
            );
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    static String hashToken(String token) {
        try {
            MessageDigest digest =
                MessageDigest.getInstance("SHA-256");

            byte[] hashed = digest.digest(
                token.getBytes(java.nio.charset.StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hashed);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException(
                "SHA-256 is unavailable", ex
            );
        }
    }
}
