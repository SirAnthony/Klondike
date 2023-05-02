import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod = 'inventory'
load(mod, {
    'not_found': 'Сущность не найдена',
    'interface': tpl`Интерфейс ${0}`,
    'desc_name': 'Название',
    'balance': 'Текущий счет',
    'expenses': 'Расходы и займы',
    'current_expenses': 'Текущие расходы',
    'currency': 'Кредиты',
    'loans': 'Займы',
    'market_prices': 'Рыночные цены',
    'res_cur': 'Собственность',
    'res_filled': 'Заполнено',
    'res_required': 'Необходимо',
    'act_order_create': 'Создать заказ',
    'act_create': 'Создать',
    'act_change': 'Изменить',
    'act_buy': 'Купить',
    'act_sell': 'Продать',
    'act_get': 'Получить',
    'act_delist': 'Снять c продажи',
    'act_delete': 'Удалить',
    'act_add': 'Добавить',
    'act_add_row': 'Добавить строку',
    'act_item_create': 'Создать сущность',
    'act_pay': 'Оплатить',
    'act_patent_pay': 'Оплатить патент',
    'act_order_pay': 'Погасить заказ',
    'act_loan_pay': 'Погасить займ',
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
    'desc_order': tpl`Текущий заказ на цикл ${0}`,
    'desc_plan': tpl`Выполнение плана: ${0}%`,
    'desc_items': 'Собственность',
    'desc_patents': 'Доступные патенты',
    'desc_current_proposals': 'Текущие предложения',
    'balance_user': 'Личный счет:',
    'balance_type_0': tpl`Счет пользователя ${0}:`,
    'balance_type_1': tpl`Счет организации ${0}:`,
    'balance_type_2': tpl`Счет лаборатории ${0}:`,
    'balance_type_3': tpl`Счет корпорации ${0}:`,
    'balance_type_4': tpl`Счет корабля ${0}:`,
    'market_proposed': tpl`Предложено ${0}`,
    'market_propose_item': 'предлагает',
    'market_propose_for_1': 'общая цена',
    'market_propose_for_3': 'в счет оплаты займа, цена',
    'loan_proposes': 'Предложения заемшиков',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}