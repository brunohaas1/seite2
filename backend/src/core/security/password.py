"""Password hashing and verification using Argon2."""

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from src.core.config import settings


class PasswordHandler:
    """Handle password hashing and verification with Argon2."""

    def __init__(self) -> None:
        self.ph = PasswordHasher(
            time_cost=settings.ARGON2_TIME_COST,
            memory_cost=settings.ARGON2_MEMORY_COST,
            parallelism=settings.ARGON2_PARALLELISM,
            hash_len=32,
            salt_len=16,
        )

    def hash_password(self, password: str) -> str:
        """Hash a password using Argon2id."""
        return self.ph.hash(password)

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash."""
        try:
            return self.ph.verify(hashed, password)
        except (VerifyMismatchError, VerificationError, InvalidHashError):
            return False

    def needs_rehash(self, hashed: str) -> bool:
        """Check if password needs rehashing due to parameter changes."""
        return self.ph.check_needs_rehash(hashed)


password_handler = PasswordHandler()