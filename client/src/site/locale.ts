import {load, isDefined, default as BL} from '../common/locale'
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
    'title_endgame': 'Игра закончилась',
    'endgame_desc': 'Спасибо Вам за игру',
    'endgame_desc2': 'Вы клаcсные и красивые',
    'endgame_comment': 'Если вы все еще не готовы и хотите выиграть корову, то нажмите продтвердить',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}