import {load, default as BL} from '../common/locale'
const mod = 'site'
load(mod, {
    'title': 'Klondike',
    'account': 'Аккаунт',
    'interface': 'Интерфейс пользователя',
    'interface_ship': 'Интерфейс корабля',
    'interface_ships': 'Список кораблей',
    'interface_corp': 'Интерфейс корпорации',
    'interface_corps': 'Список корпораций',
    'interface_map': 'Космическая карта',
    'interface_planets': 'Список планет',
})

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}