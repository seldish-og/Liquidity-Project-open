import asyncio
import json
import sqlite3
from threading import Thread
from time import sleep

import requests
from config import AUCTIONS_TABLE_NAME, DB_FILENAME
from spam_bot import send_message_to_everyone

db_name = DB_FILENAME
table_name = AUCTIONS_TABLE_NAME
MY_CONTRACT_API_URL = "http://host.docker.internal:host-gateway:3000/get_all_auctions"


def auction_exists(conn, auction: dict):
    cursor = conn.cursor()
    query = f"SELECT EXISTS(SELECT 1 FROM {table_name} WHERE startTime = ?)"
    res = cursor.execute(query, (auction["startTime"],))
    result = res.fetchone()[0]
    return bool(result)


def insert_data(conn, auction):
    cursor = conn.cursor()
    query = f"INSERT INTO {table_name} (owner, highestBidOwner, lpToken, lockIndex, startPrice, duration, startTime, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    cursor.execute(
        query,
        (
            auction["owner"],
            auction["highestBidOwner"],
            auction["lpToken"],
            auction["lockIndex"],
            auction["startPrice"],
            auction["duration"],
            auction["startTime"],
            auction["isActive"],
        ),
    )
    conn.commit()


def get_and_store_auction():
    all_auctions_response = requests.get(MY_CONTRACT_API_URL)

    if all_auctions_response.status_code == 200:
        auctions: list = all_auctions_response.json()
        conn = sqlite3.connect(f"./{db_name}")
        print(auctions)
        if not auctions:
            print("empty list")
            return

        for auction in auctions:
            if not auction_exists(conn, auction):
                print("Adding auction")
                insert_data(conn, auction)

                print(f"Sending auction: {auction}")
                asyncio.run(send_message_to_everyone(str(auction)))

            else:
                print("Auction already exists")
                pass

        conn.close()
    else:
        print(f"Error getting data: {all_auctions_response.status_code}")


def run_with_interval(func, interval):
    while True:
        func()

        sleep(interval)


if __name__ == "__main__":
    interval = 10

    # Create a thread to run the function periodically in the background
    thread = Thread(target=run_with_interval, args=(get_and_store_auction, interval))
    thread.daemon = True  # Set thread as daemon to avoid blocking program exit
    thread.start()

    # Keep the main program running (optional, can be removed if not needed)
    while True:
        sleep(1)  # Sleep for 1 second to avoid busy waiting
