import {load, tpl, isDefined, default as BL} from '../common/locale'
const mod = 'user'
load(mod, {
    'listing': 'Список пользователей',
    'profile': 'Профиль',
    'login_nav': tpl`Войти ${0}`,
    'login_nav_vk': 'Войти через ВКонтакте',
    'register_nav': tpl`Зарегистрироваться ${0}`,
    'button_signin': 'Войти',
    'button_reg': 'Зарегистрироваться',
    'button_logout': 'Выйти',
    'button_admin': 'Администрирование',
    'field_email': 'E-Mail',
    'field_phone': 'Телефон',
    'field_alias': 'Ник',
    'field_first_name': 'Имя',
    'field_second_name': 'Отчество',
    'field_last_name': 'Фамилия',
    'field_age': 'Возраст',
    'field_password': 'Пароль',
    'field_confirm': 'Повторите пароль',
    'reset_password': 'Сбросить пароль',
    'error_restricted': 'Нет доступа',
    'desc_name': 'Имя',
    'desc_alias': 'Имя',
    'desc_role': 'Роль',
    'desc_phone': 'Телефон',
    'desc_user_type_0': 'Нет',
    'desc_user_type_1': 'Корпорант',
    'desc_user_type_2': 'Капитан',
    'desc_user_type_3': 'Механик',
    'desc_user_type_4': 'Навигатор',
    'desc_user_type_5': 'Ученый',
    'desc_user_type_6': 'Охранник',
    'desc_user_type_7': 'Мастер',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}