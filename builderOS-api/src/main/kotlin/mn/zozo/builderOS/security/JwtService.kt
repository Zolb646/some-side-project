package mn.zozo.builderOS.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import mn.zozo.builderOS.users.UserEntity
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

@Service
class JwtService(
	@Value("\${app.jwt.secret}") secret: String,
	@Value("\${app.jwt.expiration-seconds}") val expirationSeconds: Long,
) {
	private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray(StandardCharsets.UTF_8))

	fun createToken(user: UserEntity): String {
		val now = Instant.now()
		val expiresAt = now.plusSeconds(expirationSeconds)

		return Jwts.builder()
			.subject(requireNotNull(user.id).toString())
			.claim("email", user.email)
			.issuedAt(Date.from(now))
			.expiration(Date.from(expiresAt))
			.signWith(key)
			.compact()
	}

	fun parseUserId(token: String): UUID {
		val claims = Jwts.parser()
			.verifyWith(key)
			.build()
			.parseSignedClaims(token)
			.payload

		return UUID.fromString(claims.subject)
	}
}
