const defaults = {
    locale: 'RU-ru',
    styles: {
        color: {
            ui_box: '#007f7f',
            ui_box_hover: '#006363',
            ui_box_light: '#488',
            ui_border: '#0ff',
            ui_border_light: '#ccc',
            ui_text: '#fff',
            ui_text_shade: '#ddd',
            ui_input: '#077',
            ui_input_focus: '#007070',
            ui_input_disabled: '#005f9f',
            ui_error: '#f00',
            hex_border: '#005f9f',
            hex_fill: '#488',
            planet_border: '#f00',
            planet_fill: '#eee',
        },
        map: {
            width: '1366px',
            height: '768px',
        }
    },
    map: {
        size: {width: 1366, height: 768},
        radius: 25,
    },
    price: {
        low_modifier: 0.8,
        high_modifier: 1.2,
    },
    date: new Date('06.05.2523'),
}
export default defaults