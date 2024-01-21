import {
    MOUSE_CLICK_EVENT,
    LOGIN_URL, AUTOPARK_URL, SHIPMENTS_URL,
} from '@configs/common_config.js';
import navbarTmpl from '@components/Navbar/navbar.handlebars';


import {Api} from '@modules/api';
import css from './navbar.scss';

const NAVBAR_ELEMENT_ID = '#navbar';
const LOGOUT_BUTTON_ID = 'exit-btn';
const AUTOPARK_BUTTON_ID = 'cars-button';
const SHIPMENTS_BUTTON_ID = 'ships-button';

/**
 * Отрисовка навбара
 * @param isAuth - авторизован ли пользователь
 */
const Navbar = (isAuth) => {
    const navbarElement = document.querySelector(NAVBAR_ELEMENT_ID);
    navbarElement.innerHTML = navbarTmpl({auth: isAuth});

    if (isAuth) {
        document.getElementById(LOGOUT_BUTTON_ID).addEventListener(MOUSE_CLICK_EVENT, async (e) => {
            e.preventDefault();
            const api = new Api();
            await api.logout();
            navbarElement.innerHTML = navbarTmpl({auth: false});
            return window.router.redirect(LOGIN_URL);
        })

        document.getElementById(AUTOPARK_BUTTON_ID).addEventListener(MOUSE_CLICK_EVENT, (e) => {
            e.preventDefault();
            return window.router.redirect(AUTOPARK_URL);
        });

        document.getElementById(SHIPMENTS_BUTTON_ID).addEventListener(MOUSE_CLICK_EVENT, (e) => {
            e.preventDefault();
            return window.router.redirect(SHIPMENTS_URL);
        })
    }
};

export default Navbar;
