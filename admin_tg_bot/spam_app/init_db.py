import sqlite3

from config import AUCTIONS_TABLE_NAME, DB_FILENAME, USERS_TABLE_NAME

conn = sqlite3.connect(DB_FILENAME)
cursor = conn.cursor()

users_init_query = f""" CREATE TABLE IF NOT EXISTS {USERS_TABLE_NAME} (
  username TEXT PRIMARY KEY
);"""

auction_init_query = f"""CREATE TABLE IF NOT EXISTS {AUCTIONS_TABLE_NAME} (
        owner TEXT,
        highestBidOwner TEXT,
        lpToken TEXT,
        lockIndex INTEGER,
        startPrice INTEGER,
        duration INTEGER,
        startTime INTEGER,
        isActive BOOLEAN
    );"""

cursor.execute(users_init_query)
cursor.execute(auction_init_query)

# test_usernames = ["gueueien", "nikimalcev"]

# for username in test_usernames:
#     cursor.execute(f"INSERT INTO {USERS_TABLE_NAME} (username) VALUES (?)", (username,))

conn.commit()
conn.close()
