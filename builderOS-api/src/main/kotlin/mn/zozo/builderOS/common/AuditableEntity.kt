package mn.zozo.builderOS.common

import jakarta.persistence.Column
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import java.time.Instant
import java.util.UUID

@MappedSuperclass
abstract class AuditableEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	var id: UUID? = null

	@Column(name = "created_at", nullable = false, updatable = false)
	var createdAt: Instant = Instant.now()

	@Column(name = "updated_at", nullable = false)
	var updatedAt: Instant = Instant.now()

	@PrePersist
	fun beforeCreate() {
		val now = Instant.now()
		createdAt = now
		updatedAt = now
	}

	@PreUpdate
	fun beforeUpdate() {
		updatedAt = Instant.now()
	}
}
