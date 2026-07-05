package mn.zozo.builderOS.projects

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import mn.zozo.builderOS.common.AuditableEntity
import mn.zozo.builderOS.users.UserEntity

@Entity
@Table(name = "projects")
class ProjectEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "owner_id", nullable = false)
	var owner: UserEntity = UserEntity(),

	@Column(nullable = false, length = 160)
	var name: String = "",

	@Column(columnDefinition = "text")
	var description: String? = null,
) : AuditableEntity()
