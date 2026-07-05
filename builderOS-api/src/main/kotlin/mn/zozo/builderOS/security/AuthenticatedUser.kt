package mn.zozo.builderOS.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

data class AuthenticatedUser(
	val id: UUID,
	private val email: String,
) : UserDetails {
	override fun getAuthorities(): Collection<GrantedAuthority> = emptyList()

	override fun getPassword(): String = ""

	override fun getUsername(): String = email
}
