import {ROOT_ELEMENT_ID} from "@configs/common_config";
import autoparkTemplate from "@components/Autopark/autopark.handlebars";

import rusImg from "@static/icons/rus.svg";

import style from '@components/Autopark/autopark.scss'
import carStyle from '@components/Car/car.scss'
import plateStyle from '@components/Plate/plate.scss'

import {Api} from "@modules/api";


const RU_REGION_PIC_CLASS = '.plate__ru-region';

/**
 * Получает наименование типа по букве
 * @param input буква типа
 * @returns {string} наименование типа
 */
function getStrByCarType(input) {
    switch (input) {
        case 'A':
            return 'Фургон'
        case 'B':
            return 'Грузовик'
        case 'C':
            return 'Фура'
    }
}

/**
 * Делит строку с номером авто на серию, номер и регион
 * @param plateStr строка с номером авто
 * @returns {{}} мапа с двумя сериями, номером и регионом
 */
function getPlateByStr(plateStr) {
    const plate = {}
    plate.series1 = plateStr.substring(0, 1);
    plate.number = plateStr.substring(1, 4);
    plate.series2 = plateStr.substring(4, 6);
    plate.region = plateStr.substring(6, plateStr.length);
    return plate;
}

/**
 * Функция отрисовки страницы с автопарком
 */
const Autopark = async () => {
    const rootElement = document.querySelector(ROOT_ELEMENT_ID);

    const api = new Api();
    const carsResponse = await api.getCars();

    const cars = carsResponse.data;

    console.log(cars);

    cars.forEach((car) => {
        car.lPlate = getPlateByStr(car.plate);
        car.sType = getStrByCarType(car.type);
    })

    rootElement.innerHTML = autoparkTemplate({cars: cars});

    const imgElement = document.querySelectorAll(RU_REGION_PIC_CLASS);

    imgElement.forEach((imgEl) => {
        imgEl.src = rusImg;
    })
}

export default Autopark;
