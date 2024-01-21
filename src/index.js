import {Router} from '@modules/router.js';
import navbar from '@components/Navbar/Navbar.js';
import {Api} from '@modules/api.js';

import reset from '@components/Shared/reset.scss';

const router = new Router();
window.router = router;

async function init() {
    const api = new Api();
    const isAuth = await api.isAuth();
    let url = window.location.href.split('/').pop();

    if (isAuth.data.body.is_authorized === true) {
        if ((url === undefined) || (url === '')) {
            url = '/shipments';
        }
        await navbar(true);
        return window.router.redirect(url);
    } else {
        await navbar(false);
    }

    return router.redirect('/login');
}

await init();

