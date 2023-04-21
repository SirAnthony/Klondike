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
    'link_users': 'Пользователи',
    'action_save': 'Сохранить',
    'res_create': 'Создать ресурс',
    'res_show': 'Настройки базовых ресурсы',
    'server_time': 'Текущее время',
    'server_cycle': 'Текущий цикл',
    'time_increase': tpl`Добавить ${0} ч.`,
    'time_decrease': tpl`Уменьшить на ${0} ч.`,
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}