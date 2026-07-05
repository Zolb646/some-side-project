package mn.zozo.builderOS.tasks

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface TaskRepository : JpaRepository<TaskEntity, UUID> {
	@Query("select t from TaskEntity t where t.owner.id = :ownerId")
	fun findByOwnerId(@Param("ownerId") ownerId: UUID, pageable: Pageable): Page<TaskEntity>

	@Query("select t from TaskEntity t where t.id = :id and t.owner.id = :ownerId")
	fun findByIdAndOwnerId(@Param("id") id: UUID, @Param("ownerId") ownerId: UUID): TaskEntity?

	@Query("select t from TaskEntity t where t.owner.id = :ownerId order by t.updatedAt desc")
	fun findRecentByOwnerId(@Param("ownerId") ownerId: UUID, pageable: Pageable): List<TaskEntity>

	@Query("select count(t) from TaskEntity t where t.owner.id = :ownerId and t.status = :status")
	fun countByOwnerIdAndStatus(@Param("ownerId") ownerId: UUID, @Param("status") status: TaskStatus): Long
}
