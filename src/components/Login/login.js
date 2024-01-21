import { Api } from '@modules/api.js';
import navbar from '@components/Navbar/Navbar.js';
import loginTemplate from '@components/Login/login.handlebars';
import {
  MIN_FAIL_RESPONSE, ROOT_ELEMENT_ID, MOUSE_CLICK_EVENT, SHIPMENTS_URL,
} from '@configs/common_config.js';

import css from './login.scss';

const LOGIN_BUTTON_CLASS = '.login-page__input-login-button';
const ERROR_TEXT_CLASS = '.login-page__error-text';
const HIDE_PASS_ID = 'hide-pass';
const PASSWORD_HIDE_ID = 'register-page__pass-icon_hide';

const LOGIN_FIELD_ID = '#login';
const PASSWORD_FIELD_ID = '#password';

const ATTRIBUTE_TYPE = 'type';
const TYPE_TEXT = 'text';
const TYPE_PASSWORD = 'password';

const LOGIN_TIMEOUT_ERROR_TEXT = 'Слишком много попыток неправильного входа. Попробуйте через 10 минут.';
const LOGIN_ERROR_TEXT = 'Неправильный логин или пароль';

/**
 * Функция отрисовки страницы логина
 */
export default async () => {
  const rootElement = document.querySelector(ROOT_ELEMENT_ID);
  rootElement.innerHTML = loginTemplate();

  const hidePassEl = document.getElementById(HIDE_PASS_ID);
  const loginBtn = document.querySelector(LOGIN_BUTTON_CLASS);

  const pass = document.getElementById(TYPE_PASSWORD);
  hidePassEl.addEventListener(MOUSE_CLICK_EVENT, (e) => {
    e.preventDefault();
    if (pass.getAttribute(ATTRIBUTE_TYPE) === TYPE_PASSWORD) {
      hidePassEl.classList.add(PASSWORD_HIDE_ID);
      pass.setAttribute(ATTRIBUTE_TYPE, TYPE_TEXT);
    } else {
      hidePassEl.classList.remove(PASSWORD_HIDE_ID);
      pass.setAttribute(ATTRIBUTE_TYPE, TYPE_PASSWORD);
    }
  });

  loginBtn.addEventListener(MOUSE_CLICK_EVENT, async (e) => {
    e.preventDefault();
    const login = document.querySelector(LOGIN_FIELD_ID);
    const pass = document.querySelector(PASSWORD_FIELD_ID);
    const api = new Api();
    const result = await api.login(login.value, pass.value);
    if (result.status >= MIN_FAIL_RESPONSE) {
      const err = document.querySelector(ERROR_TEXT_CLASS);
      if (result.status === 429) {
        err.textContent = LOGIN_TIMEOUT_ERROR_TEXT;
      } else {
        err.textContent = LOGIN_ERROR_TEXT;
      }
      return;
    }
    await navbar(true);
    router.redirect(SHIPMENTS_URL);
  });
};
