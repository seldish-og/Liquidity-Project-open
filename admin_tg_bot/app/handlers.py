import requests
from aiogram import F, Router, types
from aiogram.filters import CommandStart
from aiogram.types import Message
from app.keyboards import NumbersCallbackFactory, get_keyboard_fab, main_keyboard
from app.middlewares import AdminMiddleware
from app.smart_contract_api import get_all_deal, get_last_deal

router = Router()
router.message.middleware(AdminMiddleware())


@router.message(CommandStart())
async def start(message: Message):
    await message.reply("Welcome Admin!", reply_markup=main_keyboard)


@router.message(F.text == "Получить все заявки")
async def get_all_bids(message: Message):
    result = str(get_all_deal())

    await message.answer(result)


@router.message(F.text == "Получить новую заявку")
async def get_new_bid(message: Message):
    result = str(get_last_deal())
    bid_id = "1234"
    await message.answer(result, reply_markup=get_keyboard_fab(id=bid_id))


@router.callback_query(NumbersCallbackFactory.filter())
async def deal_handler(
    callback: types.CallbackQuery,
    callback_data: NumbersCallbackFactory,
):
    print(callback_data.value)

    if callback_data.action == "accept":
        msg = "Принято"
        # run smart contract accept callback
        # run spam func
    if callback_data.action == "decline":
        msg = "Отклонено"
        # run smart contract cancel callback

    await callback.answer("")
    await callback.message.answer(msg)
    await callback.message.edit_reply_markup()
