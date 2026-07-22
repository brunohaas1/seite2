"""AES-256-GCM encryption for sensitive data."""

import base64
import os
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from src.core.config import settings


class EncryptionHandler:
    """Handle AES-256-GCM encryption/decryption of sensitive data."""

    def __init__(self) -> None:
        key = settings.ENCRYPTION_KEY.encode("utf-8")
        if len(key) < 32:
            key = key.ljust(32, b"\0")
        elif len(key) > 32:
            key = key[:32]
        self.key = key
        self.aesgcm = AESGCM(self.key)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt plaintext and return base64-encoded ciphertext."""
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return base64.b64encode(nonce + ciphertext).decode("utf-8")

    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt base64-encoded ciphertext and return plaintext."""
        data = base64.b64decode(encrypted_data.encode("utf-8"))
        nonce = data[:12]
        ciphertext = data[12:]
        plaintext = self.aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode("utf-8")

    def encrypt_dict(self, data: dict, fields: list[str]) -> dict:
        """Encrypt specific fields in a dictionary."""
        result = data.copy()
        for field in fields:
            if field in result and result[field]:
                result[field] = self.encrypt(str(result[field]))
        return result

    def decrypt_dict(self, data: dict, fields: list[str]) -> dict:
        """Decrypt specific fields in a dictionary."""
        result = data.copy()
        for field in fields:
            if field in result and result[field]:
                try:
                    result[field] = self.decrypt(result[field])
                except Exception:
                    pass
        return result


encryption_handler = EncryptionHandler()