const {createClient} = require('redis');
const sql = require("./pgSQL");
const {Pool} = require("pg");
const cargosRequests = require("../requests/cargosRequests");

/**
 * Здесь происходили интересные эксперименты
 * Оказывается, редис при малом количестве пользователей не такой уж и эффективный, если складировать в него сложные данные
 * Потому что всё упёрлось в рассортировку этих данных на уровне языка
 * А основное время запроса занимала установка соединения с базой
 * НО
 * если пользователей много, то редис тут начинает работать быстрее
 * НО
 * поскольку в задаче не сказано, что пользователей много, то для базы используется чисто PSQL
 * хотя изначально идея была поставить редис с сентинелом (чтобы надёжнее было) и запускать крон джобу чтобы сверять
 * redis с основной бд раз в час (а может и чаще нужно, но у крона вроде бы минимум час)
 * если бы была возможность выбора дат, тогда ближайшие даты можно было бы кэшировать, так как это самые популярные
 * данные
 * но пока что одного psql по скорости хватает
 * ну и + на случай падения редиса sql бы забирала всё с резервной копии и пока он там поднимается работала бы за него
 * @returns {Promise<void>}
 */

async function cringe() {
    const givenshipments = [{
        'id': '77d57c77-e611-4824-a0e9-d801c348d3d6',
        'destination': 'uzbekistan',
        'car_plate': 'A001AA777',
        'cargos': [
            {
                'id': 'e84f280a-2c2e-4fd5-a556-1508ae4ed7f9',
                'name': 'abc',
                'amount': 2,
                'volume': 2,
            }
        ]
    },
        {
            'id': '67d57c77-e611-4824-a0e9-d801c348d3d7',
            'destination': 'uzbekistan',
            'car_plate': 'A001AA777',
            'cargos': [
                {
                    'id': 'e84f280a-2c2e-4fd5-a556-1508ae4ed7f8',
                    'name': 'abc',
                    'amount': 2,
                    'volume': 2,
                }
            ]
        },
        {
            'id': '57d57c77-e611-4824-a0e9-d801c348d3d8',
            'destination': 'uzbekistan',
            'car_plate': 'A001AA777',
            'cargos': [
                {
                    'id': 'e84f280a-2c2e-4fd5-a556-1508ae4ed7f6',
                    'name': 'abc',
                    'amount': 2,
                    'volume': 2,
                }
            ]
        },
        {
            'id': '47d57c77-e611-4824-a0e9-d801c348d3d9',
            'destination': 'uzbekistan',
            'car_plate': 'A001AA777',
            'cargos': [
                {
                    'id': 'e84f280a-2c2e-4fd5-a556-1508ae4ed7f5',
                    'name': 'abc',
                    'amount': 2,
                    'volume': 2,
                }
            ]
        },
        {
            'id': '37d57c77-e611-4824-a0e9-d801c348d3d0',
            'destination': 'uzbekistan',
            'car_plate': 'A001AA777',
            'cargos': [
                {
                    'id': 'e84f280a-2c2e-4fd5-a556-1508ae4ed7f4',
                    'name': 'abc',
                    'amount': 2,
                    'volume': 2,
                }
            ]
        },
    ]

    const shipmentIds = [];


    const connection = await createClient().connect();
    // await connection.del('shipments')
    //
    // for (const shipment of givenshipments) {
    //     const cargoIds = [];
    //     shipmentIds.push(shipment.id);
    //     await connection.hSet(`shipment-${shipment.id}`, {
    //         'destination': shipment.destination,
    //         'car_plate': shipment.car_plate
    //     });
    //     for (const cargo of shipment.cargos) {
    //         cargoIds.push(cargo.id);
    //         await connection.hSet(`cargo-${cargo.id}`, {
    //             'name': cargo.name,
    //             'amount': cargo.amount,
    //             'volume': cargo.volume
    //         });
    //     }
    //     await connection.sAdd(`shipment-${shipment.id}-cargos`, cargoIds);
    // }
    //
    // console.log(shipmentIds);
    //await connection.sAdd('shipments', shipmentIds);

    let startTime = performance.now();
    const ships = await connection.sMembers('shipments');
    let shipments = [];
    for (let i = 0; i < ships.length; i++) {
        ship = ships[i];
        const shipment = await connection.hGetAll(`shipment-${ship}`);
        shipment.id = ship;
        shipment.cargos = [];
        const cargoSet = await connection.sMembers(`shipment-${ship}-cargos`);
        for (const cargoEl of cargoSet) {
            const cargo = await connection.hGetAll(`cargo-${cargoEl}`);
            cargo.id = cargoEl;
            shipment.cargos.push(cargo);
        }
        shipments.push(shipment);
    }
    let endTime = performance.now();
    await connection.disconnect();
    console.log(`Call to do redis ${endTime - startTime} milliseconds`);
    //console.log(shipments);

    const pg = require('pg');
    const pgCon = new pg.Client({
        host: '127.0.0.1',
        port: '5432',
        database: 'autopark',
        user: 'kopilka',
        password: '12345',
    });

    await pgCon.connect();
    startTime = performance.now();
    const query = `SELECT * FROM shipments`;
    const data = await pgCon.query(query);
    for (const shipment of data.rows) {
        const query2 = `SELECT * FROM cargos WHERE shipment_id = '${shipment.id}'`;
        shipment.cargos = await pgCon.query(query2);
    }
    endTime = performance.now();
    await pgCon.end()
    console.log(`Call to do psql ${endTime - startTime} milliseconds`);
}


cringe();
