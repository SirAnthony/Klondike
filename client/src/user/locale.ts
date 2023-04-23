import {load, tpl, isDefined, default as BL} from '../common/locale'
const mod = 'user'
load(mod, {
    'listing': 'Список пользователей',
    'interface': 'Интерфейс пользователя',
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
    'desc_name': 'Имя игрока',
    'desc_fullname': 'Имя персонажа',
    'desc_role': 'Роль',
    'desc_phone': 'Телефон',
    'desc_credit': 'Баланс',
    'desc_data': 'Дополнительная информация',
    'desc_actions': 'Действия',
    'desc_filter': 'Фильтр',
    'desc_filter_kind': '',
    'desc_filter_text_placeholder': 'Имя или телефон',
    'tab_cabinet': 'Личный кабинет',
    'tab_ship': tpl`Корабль ${0}`,
    'tab_lab': tpl`Лаборатория ${0}`,
    'tab_corporation': tpl`Корпорация ${0}`,
    'tab_organization': tpl`Организация ${0}`,
    'pane_fligth_table': 'Таблица вылетов',
    'pane_inventory': 'Инвентарь',
    'pane_maps': 'Планетарные карты',
    'pane_ship': 'Корабль и дрон',
    'pane_log': 'Журнал',
    'act_show_data': 'Показать данные',
    'desc_form_data': 'Игровые данные',
    'desc_form_tooltip': 'Описание, как писать в текстарею',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}