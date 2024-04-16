from typing import Optional

from aiogram import types
from aiogram.filters.callback_data import CallbackData
from aiogram.utils.keyboard import InlineKeyboardBuilder


class NumbersCallbackFactory(CallbackData, prefix="num"):
    action: str
    value: Optional[str] = None


main_keyboard = types.ReplyKeyboardMarkup(
    keyboard=[
        [
            types.KeyboardButton(
                text="Получить новую заявку", callback_data="get_new_bid"
            ),
            types.KeyboardButton(
                text="Получить все заявки", callback_data="get_all_bids"
            ),
        ]
    ],
    resize_keyboard=True,
)


def get_keyboard_fab(id: str):
    builder = InlineKeyboardBuilder()
    builder.button(
        text="Принять", callback_data=NumbersCallbackFactory(action="accept", value=id)
    )
    builder.button(
        text="Отклонить",
        callback_data=NumbersCallbackFactory(action="decline", value=id),
    )
    builder.adjust(2)
    return builder.as_markup()


# bid_keyboard = types.InlineKeyboardMarkup(
#     inline_keyboard=[
#         [
#             types.InlineKeyboardButton(
#                 text="Принять", callback_data="accept_bid", id=0
#             ),
#             types.InlineKeyboardButton(
#                 text="Отклонить", callback_data="decline_bid", id=0
#             ),
#         ],
#     ]
# )
