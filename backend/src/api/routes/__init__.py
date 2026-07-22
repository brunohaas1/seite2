from .auth import auth_router
from .users import users_router
from .transactions import transactions_router
from .accounts import accounts_router
from .categories import categories_router
from .ocr import ocr_router
from .ai import ai_router
from .dashboard import dashboard_router
from .admin import admin_router

routers = [
    auth_router,
    users_router,
    transactions_router,
    accounts_router,
    categories_router,
    ocr_router,
    ai_router,
    dashboard_router,
    admin_router,
]