import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from app.config import BOT_TOKEN
from app.handlers import router

dp = Dispatcher()
bot = Bot(token=BOT_TOKEN)


async def main():
    dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot stopped")
