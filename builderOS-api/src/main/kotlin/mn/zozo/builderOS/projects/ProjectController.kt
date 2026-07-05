package mn.zozo.builderOS.projects

import jakarta.validation.Valid
import mn.zozo.builderOS.common.PageResponse
import mn.zozo.builderOS.common.ResourceNotFoundException
import mn.zozo.builderOS.common.newestPage
import mn.zozo.builderOS.common.toPageResponse
import mn.zozo.builderOS.security.AuthenticatedUser
import mn.zozo.builderOS.users.UserRepository
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@RestController
@RequestMapping("/api/projects")
class ProjectController(
	private val projectRepository: ProjectRepository,
	private val userRepository: UserRepository,
) {
	@GetMapping
	@Transactional(readOnly = true)
	fun list(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@RequestParam(defaultValue = "0") page: Int,
		@RequestParam(defaultValue = "20") size: Int,
	): PageResponse<ProjectResponse> =
		projectRepository.findByOwnerId(user.id, newestPage(page, size)).toPageResponse { it.toResponse() }

	@PostMapping
	@Transactional
	fun create(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@Valid @RequestBody request: ProjectRequest,
	): ProjectResponse =
		projectRepository.save(
			ProjectEntity(
				owner = userRepository.getReferenceById(user.id),
				name = request.name.trim(),
				description = request.description?.trim()?.ifBlank { null },
			),
		).toResponse()

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	fun get(@AuthenticationPrincipal user: AuthenticatedUser, @PathVariable id: UUID): ProjectResponse =
		findOwned(id, user.id).toResponse()

	@PutMapping("/{id}")
	@Transactional
	fun update(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@PathVariable id: UUID,
		@Valid @RequestBody request: ProjectRequest,
	): ProjectResponse {
		val project = findOwned(id, user.id)
		project.name = request.name.trim()
		project.description = request.description?.trim()?.ifBlank { null }
		return project.toResponse()
	}

	@DeleteMapping("/{id}")
	@Transactional
	fun delete(@AuthenticationPrincipal user: AuthenticatedUser, @PathVariable id: UUID): Map<String, Boolean> {
		projectRepository.delete(findOwned(id, user.id))
		return mapOf("ok" to true)
	}

	private fun findOwned(id: UUID, ownerId: UUID): ProjectEntity =
		projectRepository.findByIdAndOwnerId(id, ownerId) ?: throw ResourceNotFoundException("Project not found")
}
