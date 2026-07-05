package mn.zozo.builderOS.tasks

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class TaskRequest(
	val projectId: UUID? = null,

	@field:NotBlank
	@field:Size(max = 200)
	val title: String = "",

	@field:Size(max = 5000)
	val description: String? = null,

	val status: TaskStatus = TaskStatus.TODO,
	val dueDate: LocalDate? = null,
)

data class TaskResponse(
	val id: UUID,
	val projectId: UUID?,
	val title: String,
	val description: String?,
	val status: TaskStatus,
	val dueDate: LocalDate?,
	val createdAt: Instant,
	val updatedAt: Instant,
)

fun TaskEntity.toResponse(): TaskResponse =
	TaskResponse(
		id = requireNotNull(id),
		projectId = project?.id,
		title = title,
		description = description,
		status = status,
		dueDate = dueDate,
		createdAt = createdAt,
		updatedAt = updatedAt,
	)
