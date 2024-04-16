from app.config import ADMIN_USERNAMES


async def is_admin(username: str):
    return username in ADMIN_USERNAMES
