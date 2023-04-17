import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod = 'inventory'
load(mod, {
    'not_found': 'Сущность не найдена',
    'interface': tpl`Интерфейс ${0}`,
    'desc_name': 'Название',
    'balance': 'Текущий счет',
    'currency': 'Кредиты',
    'market_prices': 'Рыночные цены',
    'res_cur': 'Собственность',
    'act_order_create': 'Создать заказ',
    'act_create': 'Создать',
    'act_change': 'Изменить',
    'act_buy': 'Купить',
    'act_sell': 'Продать',
    'act_delist': 'Снять c продажи',
    'act_delete': 'Удалить',
    'act_add': 'Добавить',
    'act_add_row': 'Добавить строку',
    'act_item_create': 'Создать сущность',
    'act_pay': 'Оплатить',
    'act_forward_center': 'Передать в метрополию',
    'act_product': 'Произвести',
    'act_transfer': 'Передать',
    'act_transfer_show': 'Трансфер',
    'act_agree': 'Подтвердить',
    'act_disagree': 'Отказаться',
    'act_show_code': 'Код покупки',
    'amount_required': 'Необходимо',
    'amount_filled': 'Предоставлено',
    'confirmation_needed': 'Подтвердите действие',
    'location_desc_coord': 'координаты',
    'location_desc_planet': 'планета',
    'location_desc_system': 'система',
    'location_desc_sector': 'сектор',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}