"""Custom exception classes for structured API error responses."""


class AppException(Exception):
    """Base application exception that maps to JSEND error responses."""

    def __init__(
        self,
        status_code: int = 400,
        code: str = "BAD_REQUEST",
        message: str = "Something went wrong.",
        details: dict | None = None,
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details
        super().__init__(self.message)


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", identifier: str | None = None):
        msg = f"{resource} not found"
        if identifier:
            msg += f": {identifier}"
        super().__init__(status_code=404, code="NOT_FOUND", message=msg)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required."):
        super().__init__(status_code=401, code="UNAUTHORIZED", message=message)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions."):
        super().__init__(status_code=403, code="FORBIDDEN", message=message)


class InsufficientBalanceException(AppException):
    def __init__(self, message: str = "Insufficient balance."):
        super().__init__(status_code=422, code="INSUFFICIENT_BALANCE", message=message)


class InvalidInputException(AppException):
    def __init__(self, message: str = "Invalid input.", details: dict | None = None):
        super().__init__(status_code=400, code="INVALID_INPUT", message=message, details=details)


class RateLimitedException(AppException):
    def __init__(self, message: str = "Too many requests. Try again later."):
        super().__init__(status_code=429, code="RATE_LIMITED", message=message)


class KycRequiredException(AppException):
    def __init__(self, message: str = "KYC verification required."):
        super().__init__(status_code=403, code="KYC_REQUIRED", message=message)


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists."):
        super().__init__(status_code=409, code="CONFLICT", message=message)
