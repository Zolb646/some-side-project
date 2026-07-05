package mn.zozo.builderOS.projects

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class ProjectRequest(
	@field:NotBlank
	@field:Size(max = 160)
	val name: String = "",

	@field:Size(max = 5000)
	val description: String? = null,
)

data class ProjectResponse(
	val id: UUID,
	val name: String,
	val description: String?,
	val createdAt: Instant,
	val updatedAt: Instant,
)

fun ProjectEntity.toResponse(): ProjectResponse =
	ProjectResponse(
		id = requireNotNull(id),
		name = name,
		description = description,
		createdAt = createdAt,
		updatedAt = updatedAt,
	)
