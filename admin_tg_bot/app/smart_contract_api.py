import json

import requests


def get_last_deal():
    all_deals = requests.get("http://localhost:3000/get_all_deals").json()

    return all_deals[0]


def get_all_deal():
    all_deals = requests.get("http://localhost:3000/get_all_deals").json()

    return all_deals
