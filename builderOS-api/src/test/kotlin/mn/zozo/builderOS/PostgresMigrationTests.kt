package mn.zozo.builderOS

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import org.testcontainers.utility.DockerImageName

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class PostgresMigrationTests {
	@Test
	fun contextLoadsWithPostgresMigrations() {
	}

	companion object {
		@Container
		@JvmStatic
		val postgres: PostgreSQLContainer<*> =
			PostgreSQLContainer(DockerImageName.parse("postgres:17"))
				.withDatabaseName("builderos")
				.withUsername("builderos")
				.withPassword("builderos")

		@DynamicPropertySource
		@JvmStatic
		fun postgresProperties(registry: DynamicPropertyRegistry) {
			registry.add("spring.profiles.active") { "prod" }
			registry.add("spring.datasource.url", postgres::getJdbcUrl)
			registry.add("spring.datasource.username", postgres::getUsername)
			registry.add("spring.datasource.password", postgres::getPassword)
			registry.add("app.jwt.secret") { "testcontainers-secret-change-me-please-32chars" }
			registry.add("app.jwt.expiration-seconds") { 604800 }
			registry.add("app.cors.allowed-origins") { "http://localhost:3000" }
		}
	}
}
