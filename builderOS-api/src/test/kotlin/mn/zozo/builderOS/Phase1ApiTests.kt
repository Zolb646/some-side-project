package mn.zozo.builderOS

import com.fasterxml.jackson.databind.ObjectMapper
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.MvcResult
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class Phase1ApiTests(
	@Autowired private val mockMvc: MockMvc,
) {
	private val objectMapper = ObjectMapper()

	@Test
	fun `register login and current user work`() {
		val email = "phase-${UUID.randomUUID()}@example.com"
		val token = register(email, "Phase User")

		jsonPost("/api/auth/register", mapOf("email" to email, "displayName" to "Duplicate", "password" to "password123"))
			.andExpect(status().isConflict)

		jsonPost("/api/auth/login", mapOf("email" to email, "password" to "password123"))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.token").isString)
			.andExpect(jsonPath("$.user.email", equalTo(email.lowercase())))

		mockMvc.perform(get("/api/auth/me").bearer(token))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.email", equalTo(email.lowercase())))
	}

	@Test
	fun `owned projects tasks notes and dashboard are isolated by user`() {
		val ownerToken = register("owner-${UUID.randomUUID()}@example.com", "Owner")
		val otherToken = register("other-${UUID.randomUUID()}@example.com", "Other")

		val projectId = jsonPost(
			"/api/projects",
			mapOf("name" to "BuilderOS", "description" to "Phase 1 beta"),
			ownerToken,
		)
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.name", equalTo("BuilderOS")))
			.uuidAt("$.id")

		mockMvc.perform(get("/api/projects/$projectId").bearer(otherToken))
			.andExpect(status().isNotFound)

		jsonPut(
			"/api/projects/$projectId",
			mapOf("name" to "BuilderOS Beta", "description" to "Deployable beta"),
			ownerToken,
		)
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.name", equalTo("BuilderOS Beta")))

		val taskId = jsonPost(
			"/api/tasks",
			mapOf(
				"projectId" to projectId,
				"title" to "Ship auth",
				"description" to "JWT with personal accounts",
				"status" to "TODO",
			),
			ownerToken,
		)
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.projectId", equalTo(projectId)))
			.uuidAt("$.id")

		jsonPut(
			"/api/tasks/$taskId",
			mapOf(
				"projectId" to projectId,
				"title" to "Ship auth",
				"description" to "Done",
				"status" to "DONE",
			),
			ownerToken,
		)
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.status", equalTo("DONE")))

		val noteId = jsonPost(
			"/api/notes",
			mapOf("title" to "JWT Notes", "contentMarkdown" to "## Auth\nUse HttpOnly cookies in the web app."),
			ownerToken,
		)
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.title", equalTo("JWT Notes")))
			.uuidAt("$.id")

		mockMvc.perform(get("/api/notes/$noteId").bearer(otherToken))
			.andExpect(status().isNotFound)

		mockMvc.perform(get("/api/projects").bearer(ownerToken))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.items", hasSize<Any>(1)))

		mockMvc.perform(get("/api/dashboard").bearer(ownerToken))
			.andExpect(status().isOk)
			.andExpect(jsonPath("$.recentProjects", hasSize<Any>(1)))
			.andExpect(jsonPath("$.recentTasks", hasSize<Any>(1)))
			.andExpect(jsonPath("$.taskStatusCounts.done", equalTo(1)))

		mockMvc.perform(delete("/api/notes/$noteId").bearer(ownerToken))
			.andExpect(status().isOk)
		mockMvc.perform(delete("/api/tasks/$taskId").bearer(ownerToken))
			.andExpect(status().isOk)
		mockMvc.perform(delete("/api/projects/$projectId").bearer(ownerToken))
			.andExpect(status().isOk)
	}

	private fun register(email: String, displayName: String): String {
		val result = jsonPost(
			"/api/auth/register",
			mapOf("email" to email, "displayName" to displayName, "password" to "password123"),
		)
			.andExpect(status().isOk)
			.andReturn()

		return objectMapper.readTree(result.response.contentAsString).path("token").asText()
	}

	private fun jsonPost(path: String, body: Any, token: String? = null) =
		mockMvc.perform(
			post(path)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(body))
				.withBearer(token),
		)

	private fun jsonPut(path: String, body: Any, token: String? = null) =
		mockMvc.perform(
			put(path)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(body))
				.withBearer(token),
		)

	private fun org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder.withBearer(token: String?) =
		if (token == null) this else header("Authorization", "Bearer $token")

	private fun org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder.bearer(token: String) =
		header("Authorization", "Bearer $token")

	private fun org.springframework.test.web.servlet.ResultActions.uuidAt(path: String): String {
		val result: MvcResult = andReturn()
		val field = path.removePrefix("$.")
		return objectMapper.readTree(result.response.contentAsString).path(field).asText()
	}
}
