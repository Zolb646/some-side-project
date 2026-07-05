package mn.zozo.builderOS.users

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import mn.zozo.builderOS.common.AuditableEntity

@Entity
@Table(name = "users")
class UserEntity(
	@Column(nullable = false, unique = true)
	var email: String = "",

	@Column(name = "display_name", nullable = false, length = 120)
	var displayName: String = "",

	@Column(name = "password_hash", nullable = false)
	var passwordHash: String = "",
) : AuditableEntity()
