package mn.zozo.builderOS.auth

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class RegisterRequest(
	@field:Email
	@field:NotBlank
	val email: String = "",

	@field:NotBlank
	@field:Size(min = 2, max = 120)
	val displayName: String = "",

	@field:NotBlank
	@field:Size(min = 8, max = 128)
	val password: String = "",
)

data class LoginRequest(
	@field:Email
	@field:NotBlank
	val email: String = "",

	@field:NotBlank
	val password: String = "",
)

data class UserResponse(
	val id: UUID,
	val email: String,
	val displayName: String,
	val createdAt: Instant,
)

data class AuthResponse(
	val token: String,
	val expiresIn: Long,
	val user: UserResponse,
)
