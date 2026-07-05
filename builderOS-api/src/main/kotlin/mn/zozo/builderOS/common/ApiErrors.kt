package mn.zozo.builderOS.common

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.AuthenticationException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

data class ApiError(
	val code: String,
	val message: String,
	val details: Map<String, String> = emptyMap(),
)

class ConflictException(message: String) : RuntimeException(message)

class ResourceNotFoundException(message: String = "Resource not found") : RuntimeException(message)

@RestControllerAdvice
class ApiExceptionHandler {
	@ExceptionHandler(ConflictException::class)
	fun conflict(ex: ConflictException): ResponseEntity<ApiError> =
		ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError("CONFLICT", ex.message ?: "Conflict"))

	@ExceptionHandler(ResourceNotFoundException::class)
	fun notFound(ex: ResourceNotFoundException): ResponseEntity<ApiError> =
		ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError("NOT_FOUND", ex.message ?: "Resource not found"))

	@ExceptionHandler(BadCredentialsException::class, AuthenticationException::class)
	fun unauthorized(): ResponseEntity<ApiError> =
		ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError("UNAUTHORIZED", "Authentication failed"))

	@ExceptionHandler(MethodArgumentNotValidException::class)
	fun validation(ex: MethodArgumentNotValidException): ResponseEntity<ApiError> {
		val details = ex.bindingResult.allErrors.associate { error ->
			val field = (error as? FieldError)?.field ?: error.objectName
			field to (error.defaultMessage ?: "Invalid value")
		}

		return ResponseEntity
			.status(HttpStatus.BAD_REQUEST)
			.body(ApiError("VALIDATION_ERROR", "Request validation failed", details))
	}

	@ExceptionHandler(Exception::class)
	fun unexpected(ex: Exception, request: HttpServletRequest): ResponseEntity<ApiError> {
		if (request.getAttribute("jakarta.servlet.error.exception") != null) {
			throw ex
		}

		return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiError("INTERNAL_ERROR", "Something went wrong"))
	}
}
