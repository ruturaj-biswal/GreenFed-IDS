
package greenfed_resource_monitor.client;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientCredentialRepository
        extends JpaRepository<ClientCredential, UUID> {

    Optional<ClientCredential> findByTokenHash(String tokenHash);
}
