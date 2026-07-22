"""JWT token handling with RS256 signing."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from src.core.config import settings


class JWTHandler:
    """Handle JWT token creation and verification."""

    def __init__(self) -> None:
        self.algorithm = settings.JWT_ALGORITHM
        self.secret_key = settings.JWT_SECRET_KEY
        self.access_token_expire = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS

    def create_access_token(
        self,
        subject: str,
        extra_claims: Optional[dict] = None,
    ) -> str:
        """Create an access token."""
        now = datetime.now(timezone.utc)
        payload = {
            "sub": subject,
            "iat": now,
            "exp": now + timedelta(minutes=self.access_token_expire),
            "type": "access",
        }
        if extra_claims:
            payload.update(extra_claims)
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(
        self,
        subject: str,
        token_id: str,
    ) -> str:
        """Create a refresh token."""
        now = datetime.now(timezone.utc)
        payload = {
            "sub": subject,
            "jti": token_id,
            "iat": now,
            "exp": now + timedelta(days=self.refresh_token_expire),
            "type": "refresh",
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> dict:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
            )
            return payload
        except JWTError:
            return {}

    def get_subject_from_token(self, token: str) -> Optional[str]:
        """Extract subject (user_id) from token."""
        payload = self.verify_token(token)
        return payload.get("sub")

    def is_token_expired(self, token: str) -> bool:
        """Check if token is expired."""
        payload = self.verify_token(token)
        exp = payload.get("exp")
        if exp is None:
            return True
        return datetime.now(timezone.utc).timestamp() > exp


jwt_handler = JWTHandler()
create_access_token = jwt_handler.create_access_token
create_refresh_token = jwt_handler.create_refresh_token
verify_token = jwt_handler.verify_token