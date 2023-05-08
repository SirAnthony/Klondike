import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod='adm'
load(mod, {
    'not_found': 'Не найдено',
    'interface': 'Интерфейс администратора',
    'listing': 'Список',
    'desc_name': 'Название',
    'link_rating': 'Время и результаты',
    'link_orders': 'Заказы',
    'link_resources': 'Ресурсы и цены',
    'link_ships': 'Корабли',
    'link_corps': 'Корпорации',
    'link_planets': 'Планеты',
    'link_flights': 'Таблица вылетов',
    'link_users': 'Пользователи',
    'link_logs': 'События',
    'link_qrcode': 'QRCode',
    'act_save': 'Сохранить',
    'res_create': 'Создать ресурс',
    'res_show': 'Настройки базовых ресурсы',
    'endgame': 'Конец игры',
    'server_time': 'Текущее время',
    'server_cycle': 'Текущий цикл',
    'server_cycle_length': 'Длина цикла в часах',
    'time_increase': tpl`Добавить ${0} ч.`,
    'time_decrease': tpl`Уменьшить на ${0} ч.`,
    // config
    'config_setup': 'Настройки',
    'config_setup_pace': 'Настройки скорости событий',
    'config_setup_points': 'Настройки очков рейтинга',
    'time.market': 'Изменение рыночных цен, час',
    'time.ship.speed': 'Время движения на 1 тайл, сек',
    'time.ship.research': 'Время исследования тайла, сек',
    'points.patent.pay': 'Оплата патента лабораторией',
    'points.patent': tpl`Очки за закрытие патента. ${0} владение`,
    'points.order': 'Очки за закрытие заказа',
    'res_spec_value_open': '<50%',
    'res_spec_value_halfclosed': '50% <> 100%',
    'config_setup_prices': 'Настройки цен',
    'act_add_cycle': 'Добавить цикл',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}