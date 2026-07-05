package mn.zozo.builderOS.auth

import jakarta.validation.Valid
import mn.zozo.builderOS.security.AuthenticatedUser
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
	private val authService: AuthService,
) {
	@PostMapping("/register")
	fun register(@Valid @RequestBody request: RegisterRequest): AuthResponse =
		authService.register(request)

	@PostMapping("/login")
	fun login(@Valid @RequestBody request: LoginRequest): AuthResponse =
		authService.login(request)

	@GetMapping("/me")
	fun me(@AuthenticationPrincipal user: AuthenticatedUser): UserResponse =
		authService.currentUser(user)

	@PostMapping("/logout")
	fun logout(): Map<String, Boolean> = mapOf("ok" to true)
}
