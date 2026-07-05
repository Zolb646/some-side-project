package mn.zozo.builderOS.common

import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort

data class PageResponse<T>(
	val items: List<T>,
	val page: Int,
	val size: Int,
	val totalElements: Long,
	val totalPages: Int,
)

fun newestPage(page: Int, size: Int): Pageable =
	PageRequest.of(
		page.coerceAtLeast(0),
		size.coerceIn(1, 100),
		Sort.by(Sort.Direction.DESC, "updatedAt"),
	)

fun <T : Any, R> Page<T>.toPageResponse(mapper: (T) -> R): PageResponse<R> =
	PageResponse(
		items = content.map(mapper),
		page = number,
		size = size,
		totalElements = totalElements,
		totalPages = totalPages,
	)
