package mn.zozo.builderOS.notes

import jakarta.validation.Valid
import mn.zozo.builderOS.common.PageResponse
import mn.zozo.builderOS.common.ResourceNotFoundException
import mn.zozo.builderOS.common.newestPage
import mn.zozo.builderOS.common.toPageResponse
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
@RequestMapping("/api/notes")
class NoteController(
	private val noteRepository: NoteRepository,
	private val userRepository: UserRepository,
) {
	@GetMapping
	@Transactional(readOnly = true)
	fun list(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@RequestParam(defaultValue = "0") page: Int,
		@RequestParam(defaultValue = "20") size: Int,
	): PageResponse<NoteResponse> =
		noteRepository.findByOwnerId(user.id, newestPage(page, size)).toPageResponse { it.toResponse() }

	@PostMapping
	@Transactional
	fun create(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@Valid @RequestBody request: NoteRequest,
	): NoteResponse =
		noteRepository.save(
			NoteEntity(
				owner = userRepository.getReferenceById(user.id),
				title = request.title.trim(),
				contentMarkdown = request.contentMarkdown,
			),
		).toResponse()

	@GetMapping("/{id}")
	@Transactional(readOnly = true)
	fun get(@AuthenticationPrincipal user: AuthenticatedUser, @PathVariable id: UUID): NoteResponse =
		findOwned(id, user.id).toResponse()

	@PutMapping("/{id}")
	@Transactional
	fun update(
		@AuthenticationPrincipal user: AuthenticatedUser,
		@PathVariable id: UUID,
		@Valid @RequestBody request: NoteRequest,
	): NoteResponse {
		val note = findOwned(id, user.id)
		note.title = request.title.trim()
		note.contentMarkdown = request.contentMarkdown
		return note.toResponse()
	}

	@DeleteMapping("/{id}")
	@Transactional
	fun delete(@AuthenticationPrincipal user: AuthenticatedUser, @PathVariable id: UUID): Map<String, Boolean> {
		noteRepository.delete(findOwned(id, user.id))
		return mapOf("ok" to true)
	}

	private fun findOwned(id: UUID, ownerId: UUID): NoteEntity =
		noteRepository.findByIdAndOwnerId(id, ownerId) ?: throw ResourceNotFoundException("Note not found")
}
