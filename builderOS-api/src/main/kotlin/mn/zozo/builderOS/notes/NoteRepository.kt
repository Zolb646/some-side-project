package mn.zozo.builderOS.notes

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface NoteRepository : JpaRepository<NoteEntity, UUID> {
	@Query("select n from NoteEntity n where n.owner.id = :ownerId")
	fun findByOwnerId(@Param("ownerId") ownerId: UUID, pageable: Pageable): Page<NoteEntity>

	@Query("select n from NoteEntity n where n.id = :id and n.owner.id = :ownerId")
	fun findByIdAndOwnerId(@Param("id") id: UUID, @Param("ownerId") ownerId: UUID): NoteEntity?
}
