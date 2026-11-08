
package greenfed_resource_monitor.telemetry;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceSampleRepository
        extends JpaRepository<ResourceSample, Long> {

    List<ResourceSample> findByClient_ClientIdOrderByObservedAtDesc(
            UUID clientId);
}
