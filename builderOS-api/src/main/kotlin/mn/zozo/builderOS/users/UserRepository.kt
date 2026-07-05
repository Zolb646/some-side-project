package mn.zozo.builderOS.users

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository : JpaRepository<UserEntity, UUID> {
	fun existsByEmailIgnoreCase(email: String): Boolean

	fun findByEmailIgnoreCase(email: String): UserEntity?
}
