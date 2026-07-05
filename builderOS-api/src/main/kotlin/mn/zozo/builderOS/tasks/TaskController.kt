package mn.zozo.builderOS.tasks

import jakarta.validation.Valid
import mn.zozo.builderOS.common.PageResponse
import mn.zozo.builderOS.common.ResourceNotFoundException
import mn.zozo.builderOS.common.newestPage
import mn.zozo.builderOS.common.toPageResponse
import mn.zozo.builderOS.projects.ProjectEntity
import mn.zozo.builderOS.projects.ProjectRepository
import mn.zozo.builderOS.security.AuthenticatedUser
import mn.zozo.builderOS.users.UserRepository
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/tasks")
class TaskController(
	private val taskRepository: TaskRepository,
	private val projectRepository: ProjectRepository,
	private val userRepository: UserRepository,
) {
	@GetMapping
	@Transactional(readOnly = true)
	fun list(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@RequestParam(defaultValue = "0") page: Int,
		@RequestParam(defaultValue = "20") size: Int,
	): PageResponse<TaskResponse> =
		taskRepository.findByOwnerId(user.id, newestPage(page, size)).toPageResponse { it.toResponse() }

	@PostMapping
	@Transactional
	fun create(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@Valid @RequestBody request: TaskRequest,
	): TaskResponse =
		taskRepository.save(
			TaskEntity(
				owner = userRepository.getReferenceById(user.id),
				project = ownedProject(request.projectId, user.id),
				title = request.title.trim(),
				description = request.description?.trim()?.ifBlank { null },
				status = request.status,
				dueDate = request.dueDate,
			),
		).toResponse()

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	fun get(@AuthenticationPrincipal user: AuthenticatedUser, @PathVariable id: UUID): TaskResponse =
		findOwned(id, user.id).toResponse()

	@PutMapping("/{id}")
	@Transactional
	fun update(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@PathVariable id: UUID,
		@Valid @RequestBody request: TaskRequest,
	): TaskResponse {
		val task = findOwned(id, user.id)
		task.project = ownedProject(request.projectId, user.id)
		task.title = request.title.trim()
		task.description = request.description?.trim()?.ifBlank { null }
		task.status = request.status
		task.dueDate = request.dueDate
		return task.toResponse()
	}

	@DeleteMapping("/{id}")
	@Transactional
	fun delete(@AuthenticationPrincipal user: AuthenticatedUser, @PathVariable id: UUID): Map<String, Boolean> {
		taskRepository.delete(findOwned(id, user.id))
		return mapOf("ok" to true)
	}

	private fun findOwned(id: UUID, ownerId: UUID): TaskEntity =
		taskRepository.findByIdAndOwnerId(id, ownerId) ?: throw ResourceNotFoundException("Task not found")

	private fun ownedProject(projectId: UUID?, ownerId: UUID): ProjectEntity? =
		projectId?.let {
			projectRepository.findByIdAndOwnerId(it, ownerId)
				?: throw ResourceNotFoundException("Project not found")
		}
}
