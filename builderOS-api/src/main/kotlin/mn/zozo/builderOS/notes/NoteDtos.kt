package mn.zozo.builderOS.notes

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class NoteRequest(
	@field:NotBlank
	@field:Size(max = 200)
	val title: String = "",

	@field:Size(max = 20000)
	val contentMarkdown: String = "",
)

data class NoteResponse(
	val id: UUID,
	val title: String,
	val contentMarkdown: String,
	val createdAt: Instant,
	val updatedAt: Instant,
)

fun NoteEntity.toResponse(): NoteResponse =
	NoteResponse(
		id = requireNotNull(id),
		title = title,
		contentMarkdown = contentMarkdown,
		createdAt = createdAt,
		updatedAt = updatedAt,
	)
