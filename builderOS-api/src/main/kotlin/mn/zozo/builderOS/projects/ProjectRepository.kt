package mn.zozo.builderOS.projects

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface ProjectRepository : JpaRepository<ProjectEntity, UUID> {
	@Query("select p from ProjectEntity p where p.owner.id = :ownerId")
	fun findByOwnerId(@Param("ownerId") ownerId: UUID, pageable: Pageable): Page<ProjectEntity>

	@Query("select p from ProjectEntity p where p.id = :id and p.owner.id = :ownerId")
	fun findByIdAndOwnerId(@Param("id") id: UUID, @Param("ownerId") ownerId: UUID): ProjectEntity?

	@Query("select p from ProjectEntity p where p.owner.id = :ownerId order by p.updatedAt desc")
	fun findRecentByOwnerId(@Param("ownerId") ownerId: UUID, pageable: Pageable): List<ProjectEntity>
}
