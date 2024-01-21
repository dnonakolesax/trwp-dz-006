import login from '@components/Login/login.js';
import Shipments from "@components/Shipments/shipments";
import Autopark from "@components/Autopark/autopark";
import NotFound from "@components/NotFound/NotFound";

/**
 * Массив объектов с url и функциями отрисовки страниц
 */
export const routes = {
  login: {
    render: login,
  },
  shipments: {
    render: Shipments
  },
  autopark: {
    render: Autopark
  },
  notfound: {
    render: NotFound
  }
};
