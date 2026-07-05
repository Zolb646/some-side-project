package mn.zozo.builderOS.tasks

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import mn.zozo.builderOS.common.AuditableEntity
import mn.zozo.builderOS.projects.ProjectEntity
import mn.zozo.builderOS.users.UserEntity
import java.time.LocalDate

@Entity
@Table(name = "tasks")
class TaskEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "owner_id", nullable = false)
	var owner: UserEntity = UserEntity(),

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "project_id")
	var project: ProjectEntity? = null,

	@Column(nullable = false, length = 200)
	var title: String = "",

	@Column(columnDefinition = "text")
	var description: String? = null,

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	var status: TaskStatus = TaskStatus.TODO,

	@Column(name = "due_date")
	var dueDate: LocalDate? = null,
) : AuditableEntity()
