const fs = require('fs');

const axios = require('axios');

class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // Leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado (){
        // Capitalizar cada palabra
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join( ' ' );

        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenweather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad( lugar = '' ) {
        
        try {
            //Peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            })
            //Hago un request a la url (endpoint) que necesito y 
            //guardo el resultado en una variable RESP
            const resp = await instance.get();
            return resp.data.features.map( lugar => ({   //lugar => ({})
                id: lugar.id,
                nombre: lugar.place_name,
                lon: lugar.center[0],
                lat: lugar.center[1]
            }));


        } catch (error) {
            console.log(error);
            return [];
        }
        
    }


    async climaLugar( lat, lon ) {

        try {

            //Peticion http
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                 params: { ...this.paramsOpenweather, lat, lon }
            })

            //resp.data
            const resp = await instance.get();
            const { weather, main } = resp.data; //extraigo de data el weather y el main

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
            
        } catch (error) {
            console.log(error);
        }
    }



    agregarHistorial( lugar = '' ) {
        
        // Prevenir duplicados
        if (this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }
        
        this.historial = this.historial.splice(0,5); //con esto solo mantengo 6 en mi historial.

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en DB
        this.guardarDB();
    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    leerDB() {
        // Debe de existir ...
        if ( !fs.existsSync( this.dbPath ) ) return; //si no existe sale y no hace nada mas, version corta del if

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const data = JSON.parse( info ); //lo parseo para que vuelva a ser un objeto json
        this.historial = data.historial;

    }


}



module.exports = Busquedas;