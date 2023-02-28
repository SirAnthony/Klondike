import {load, default as BL} from '../common/locale'
const mod = 'site'
load(mod, {
    'title': 'Klondike',
    'account': 'Аккаунт',
    'interface_ship': 'Интерфейс корабля',
    'interface_ship_list': 'Список кораблей',
    'interface_corp': 'Интерфейс корпорации',
    'interface_corp_list': 'Список корпораций',
    'interface_map': 'Космическая карта',
    'interface_planet_list': 'Список планет',
})

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}