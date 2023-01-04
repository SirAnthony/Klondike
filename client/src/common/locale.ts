const aliases = {
    'site_title': 'Klondike',
    'site_account': 'Аккаунт',
    'site_interface_ship': 'Интерфейс корабля',
    'login_nav': tpl`Войти ${0}`,
    'login_nav_vk': 'Войти через ВКонтакте',
    'register_nav': tpl`Зарегистрироваться ${0}`,
    'field_email': 'E-Mail',
    'field_phone': 'Телефон',
    'field_alias': 'Ник',
    'field_first_name': 'Имя',
    'field_second_name': 'Отчество',
    'field_last_name': 'Фамилия',
    'field_age': 'Возраст',
    'field_password': 'Пароль',
    'field_confirm': 'Повторите пароль',
    'button_signin': 'Войти',
    'button_reg': 'Зарегистрироваться',
    'field_error_notvalid': 'Заполнено неверно',
    'field_error_invalid': 'Неверный параметр',
    'field_error_noempty': 'Заполните',
    'field_error_notmatch': 'Поля не совпадают',
    'field_error_unknown': 'Неизвестное поле',
    'field_error_need2': 'Заполните минимум 2 поля',
    'field_error_realage': 'Введите реальный',
    'field_error_tooshort': 'Должно быть длиннее',
    'form_error_notvalid': 'Пожалуйста исправьте ошибки',
    'error_account_exists': 'Аккаунт уже существует',
    'login_error_noemail': 'При входе не был указан E-mail',
    'login_error_invalid': 'Неправильные имя пользователя или пароль',
    'save_change': 'Сохранить изменения',
    'reset_password': 'Сбросить пароль',
    'reset_password_sent': 'Письмо с инструкциями отправлено',
    'order_error_type': 'Невозможно забронировать данный тип поселения',
    'order_error_pass': 'Пароль неверен',
    'should be an email': 'Должно быть E-mail адресом',
    'should not be empty': 'Не должно быть пустым',
    'length should bigger than 6': 'Должно быть длиннее',
    'required': 'Заполните',
    'Validation Failed': 'Пожалуйста исправьте ошибки',
    'thursday': 'четверг',
    'friday': 'пятница',
    'saturday': 'суббота',
    'sunday': 'воскресенье',
    'breakfast': 'завтрак',
    'lunch': 'обед',
    'dinner': 'ужин',
    'error_account_retrive': 'Аккаунт создан, но авторизация не удалась, '+
        'обновите страницу и войдите',
}

export function extend(obj: {string: string | ((...values: any[])=>string)}) {
    for (let k in obj)
        aliases[k] = obj[k];
}

export function tpl(strings, ...keys) {
    return (function(...values) {
      let dict = values[values.length - 1] || {};
      let result = [strings[0]];
      keys.forEach(function(key, i) {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join('');
    });
}

export function load(type, values) {
    for (let key in values)
        aliases[`${type}_${key}`] = values[key]
}

export default function L(str: string, ...args): string {
    const ret = aliases[str]||str
    return typeof ret==='function' ? ret(...args) : ret
}