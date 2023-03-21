import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod='adm'
load(mod, {
    'not_found': 'Не найдено',
    'interface': 'Интерфейс администратора',
    'listing': 'Список',
    'desc_name': 'Название',
    'link_orders': 'Заказы',
    'link_resources': 'Ресурсы и цены',
    'link_ships': 'Корабли',
    'link_corps': 'Корпорации',
    'link_users': 'Пользователи',
    'res_create': 'Создать ресурс',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}