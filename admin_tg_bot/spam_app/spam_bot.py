import asyncio
import sqlite3

from config import API_HASH, API_ID, DB_FILENAME, USERS_TABLE_NAME
from telethon import TelegramClient, errors


async def send_message_to_everyone(msg):
    async with TelegramClient("userbot", API_ID, API_HASH) as client:

        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()

        cursor.execute(f"SELECT username FROM {USERS_TABLE_NAME}")
        usernames = [row[0] for row in cursor.fetchall()]

        for username in usernames:
            try:
                user = await client.get_entity(username)

                await client.send_message(user, msg)
                print(f"Message sent to {username}")
            except errors.UsernameInvalidError:
                print(f"Invalid username: {username}")
            except Exception:
                print(f"Error sending message to {username}")
                pass

        conn.close()


# if __name__ == "__main__":

#     asyncio.run(send_message_to_everyone("dfdf"))
