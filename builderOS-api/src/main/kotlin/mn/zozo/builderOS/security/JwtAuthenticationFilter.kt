package mn.zozo.builderOS.security

import io.jsonwebtoken.JwtException
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mn.zozo.builderOS.users.UserRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
	private val jwtService: JwtService,
	private val userRepository: UserRepository,
) : OncePerRequestFilter() {
	override fun doFilterInternal(
		request: HttpServletRequest,
		response: HttpServletResponse,
		filterChain: FilterChain,
	) {
		val header = request.getHeader("Authorization")
		val token = header
			?.takeIf { it.startsWith("Bearer ", ignoreCase = true) }
			?.substringAfter(" ")

		if (token != null && SecurityContextHolder.getContext().authentication == null) {
			authenticate(token)
		}

		filterChain.doFilter(request, response)
	}

	private fun authenticate(token: String) {
		try {
			val userId = jwtService.parseUserId(token)
			val user = userRepository.findByIdOrNull(userId) ?: return
			val principal = AuthenticatedUser(requireNotNull(user.id), user.email)
			val authentication = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
			SecurityContextHolder.getContext().authentication = authentication
		} catch (_: JwtException) {
			SecurityContextHolder.clearContext()
		} catch (_: IllegalArgumentException) {
			SecurityContextHolder.clearContext()
		}
	}
}
