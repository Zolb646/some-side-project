package mn.zozo.builderOS.auth

import mn.zozo.builderOS.common.ConflictException
import mn.zozo.builderOS.common.ResourceNotFoundException
import mn.zozo.builderOS.security.AuthenticatedUser
import mn.zozo.builderOS.security.JwtService
import mn.zozo.builderOS.users.UserEntity
import mn.zozo.builderOS.users.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
	private val userRepository: UserRepository,
	private val passwordEncoder: PasswordEncoder,
	private val jwtService: JwtService,
) {
	@Transactional
	fun register(request: RegisterRequest): AuthResponse {
		val normalizedEmail = request.email.trim().lowercase()
		if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
			throw ConflictException("Email is already registered")
		}

		val user = userRepository.save(
			UserEntity(
				email = normalizedEmail,
				displayName = request.displayName.trim(),
				passwordHash = requireNotNull(passwordEncoder.encode(request.password)),
			),
		)

		return authResponse(user)
	}

	@Transactional(readOnly = true)
	fun login(request: LoginRequest): AuthResponse {
		val user = userRepository.findByEmailIgnoreCase(request.email.trim().lowercase())
			?: throw BadCredentialsException("Invalid email or password")

		if (!passwordEncoder.matches(request.password, user.passwordHash)) {
			throw BadCredentialsException("Invalid email or password")
		}

		return authResponse(user)
	}

	@Transactional(readOnly = true)
	fun currentUser(authenticatedUser: AuthenticatedUser): UserResponse {
		val user = userRepository.findByIdOrNull(authenticatedUser.id)
			?: throw ResourceNotFoundException("User not found")

		return user.toResponse()
	}

	private fun authResponse(user: UserEntity): AuthResponse =
		AuthResponse(
			token = jwtService.createToken(user),
			expiresIn = jwtService.expirationSeconds,
			user = user.toResponse(),
		)
}

fun UserEntity.toResponse(): UserResponse =
	UserResponse(
		id = requireNotNull(id),
		email = email,
		displayName = displayName,
		createdAt = createdAt,
	)
