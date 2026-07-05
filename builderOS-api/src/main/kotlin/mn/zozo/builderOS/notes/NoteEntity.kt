package mn.zozo.builderOS.notes

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import mn.zozo.builderOS.common.AuditableEntity
import mn.zozo.builderOS.users.UserEntity

@Entity
@Table(name = "notes")
class NoteEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "owner_id", nullable = false)
	var owner: UserEntity = UserEntity(),

	@Column(nullable = false, length = 200)
	var title: String = "",

	@Column(name = "content_markdown", nullable = false, columnDefinition = "text")
	var contentMarkdown: String = "",
) : AuditableEntity()
