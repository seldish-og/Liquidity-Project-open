from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware, types
from app.utils import is_admin


class AdminMiddleware(BaseMiddleware):
    def __init__(self):

        super(AdminMiddleware, self).__init__()

    async def __call__(
        self,
        handler: Callable[[types.TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: types.TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        try:
            if await is_admin(event.chat.username):
                await handler(event, data)
            else:
                await event.answer("Вы не являетесь администратором")
        except Exception as e:
            print(e)
            await event.answer("Что-то пошло не так")
