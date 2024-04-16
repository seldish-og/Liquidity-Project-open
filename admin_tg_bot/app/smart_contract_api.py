import json

import requests
from app.config import CONTRACT_URL


def get_last_deal():
    print(CONTRACT_URL)

    all_deals = requests.get(f"{CONTRACT_URL}/get_all_deals").json()

    return all_deals[0]


def get_all_deal():
    print(CONTRACT_URL)
    all_deals = requests.get(f"{CONTRACT_URL}/get_all_deals").json()

    return all_deals
