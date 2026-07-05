package mn.zozo.builderOS.dashboard

import mn.zozo.builderOS.projects.ProjectRepository
import mn.zozo.builderOS.projects.toResponse
import mn.zozo.builderOS.security.AuthenticatedUser
import mn.zozo.builderOS.tasks.TaskRepository
import mn.zozo.builderOS.tasks.TaskStatus
import mn.zozo.builderOS.tasks.toResponse
import org.springframework.data.domain.PageRequest
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
	private val projectRepository: ProjectRepository,
	private val taskRepository: TaskRepository,
) {
	@GetMapping
	@Transactional(readOnly = true)
	fun dashboard(@AuthenticationPrincipal user: AuthenticatedUser): DashboardResponse =
		DashboardResponse(
			recentProjects = projectRepository.findRecentByOwnerId(user.id, PageRequest.of(0, 5)).map { it.toResponse() },
			recentTasks = taskRepository.findRecentByOwnerId(user.id, PageRequest.of(0, 5)).map { it.toResponse() },
			taskStatusCounts = TaskStatusCountsResponse(
				todo = taskRepository.countByOwnerIdAndStatus(user.id, TaskStatus.TODO),
				inProgress = taskRepository.countByOwnerIdAndStatus(user.id, TaskStatus.IN_PROGRESS),
				done = taskRepository.countByOwnerIdAndStatus(user.id, TaskStatus.DONE),
			),
		)
}
