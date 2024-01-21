import {ROOT_ELEMENT_ID} from "@configs/common_config";
import notFoundTemplate from "@components/NotFound/NotFound.handlebars";

import style from '@components/NotFound/NotFound.scss'

const NotFound = async () => {
    const rootElement = document.querySelector(ROOT_ELEMENT_ID);
    rootElement.innerHTML = notFoundTemplate();
}

export default NotFound;
