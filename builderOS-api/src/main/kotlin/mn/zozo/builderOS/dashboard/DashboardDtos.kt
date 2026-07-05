package mn.zozo.builderOS.dashboard

import mn.zozo.builderOS.projects.ProjectResponse
import mn.zozo.builderOS.tasks.TaskResponse

data class TaskStatusCountsResponse(
	val todo: Long,
	val inProgress: Long,
	val done: Long,
)

data class DashboardResponse(
	val recentProjects: List<ProjectResponse>,
	val recentTasks: List<TaskResponse>,
	val taskStatusCounts: TaskStatusCountsResponse,
)
