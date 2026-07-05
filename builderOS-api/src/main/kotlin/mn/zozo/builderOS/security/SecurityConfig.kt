package mn.zozo.builderOS.security

import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig(
	@Value("\${app.cors.allowed-origins}") private val allowedOrigins: String,
) {
	@Bean
	fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

	@Bean
	fun securityFilterChain(http: HttpSecurity, jwtAuthenticationFilter: JwtAuthenticationFilter): SecurityFilterChain =
		http
			.csrf { it.disable() }
			.cors { it.configurationSource(corsConfigurationSource()) }
			.sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
			.exceptionHandling {
				it.authenticationEntryPoint { _, response, _ ->
					response.status = HttpServletResponse.SC_UNAUTHORIZED
					response.contentType = "application/json"
					response.writer.write("""{"code":"UNAUTHORIZED","message":"Authentication required"}""")
				}
			}
			.authorizeHttpRequests {
				it
					.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
					.requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
					.anyRequest().authenticated()
			}
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
			.build()

	@Bean
	fun corsConfigurationSource(): CorsConfigurationSource {
		val configuration = CorsConfiguration()
		configuration.allowedOrigins = allowedOrigins.split(",").map { it.trim() }.filter { it.isNotEmpty() }
		configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
		configuration.allowedHeaders = listOf("Authorization", "Content-Type")
		configuration.allowCredentials = true

		return UrlBasedCorsConfigurationSource().also {
			it.registerCorsConfiguration("/**", configuration)
		}
	}
}
