require ('dotenv').config();


const { inquirerMenu,
        pausa,
        leerInput,
        listarLugares
} = require("./helpers/inquirer");

const Busquedas = require("./models/busquedas");

// console.log(process.env); //variables de entorno GLOBALES  a lo largo de mi APP.
// console.log(process.env.MAPBOX_KEY);// variable de entorno especifica

const main = async() => {

    const busquedas = new Busquedas();
    let opt;

    do {
        //imprimir el menu
        opt = await inquirerMenu();    

        switch (opt) {
            case 1: //Buscar ciudad
                //Mostrar mensaje
                const termino = await leerInput('Ciudad: ');

                //Buscar los lugares like busqueda PETICION HTTP
                const lugares = await busquedas.ciudad(termino);

                // Seleccionar el lugar
                const id = await listarLugares(lugares);
                if ( id === '0' ) continue; //si selecciona el 0 entonces vuelve a empezar sin tirar error
                
                const lugarSel = lugares.find( l => l.id === id);

                //Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );


                // Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lon );

                // Mostrar resultados
                console.clear();
                console.log('\nInformacion del lugar\n'.green);
                console.log('Ciudad: ', lugarSel.nombre.green );
                console.log('Lat: ', lugarSel.lat );
                console.log('Lon: ', lugarSel.lon );
                console.log('Temperatura: ', clima.temp );
                console.log('T. Min: ', clima.min);
                console.log('T. Max: ', clima.max);
                console.log('El clima: ', clima.desc.green );
            break;

            case 2: // Historial 
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                // busquedas.historial.forEach( (lugar, i) => {
                    const idx = ` ${ i + 1 }. `.green;
                    console.log( ` ${ idx } ${ lugar } ` );
                })

            break;       
        }


        if (opt !== 0) await pausa();


    } while ( opt !== 0 );
}

main();