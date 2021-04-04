'use strict';

const express=require('express');
require('dotenv').config();
const server=express();

const cors = require('cors');
server.use(cors());
const PORT=process.env.PORT || 4000;

server.listen(PORT,() =>{
    console.log(`hello PORT ${PORT}`)
});

 server.get('/test',(req,res)=>{
     res.send('HERE WE GO');
 });

server.get('/location', (req,res)=>{
let getData= require('./data/location.json');
let getLocation =new Location(getData);
res.send(getLocation);
})

// {
//   "search_query": "seattle",
//   "formatted_query": "Seattle, WA, USA",
//   "latitude": "47.606210",
//   "longitude": "-122.332071"
// }

function Location (locationData) {
    this.search_query ='Lynwood' ;
    this.formatted_query=locationData[0].display_name;
    this.latitude=locationData[0].lat;
    this.longitude=locationData[0].lon;

}

server.get('/weather', (req,res)=>{
    let getData=require('./data/weather.json');
    let weatherArray=[];
    getData.data.forEach(element => {
        let getWeather= new Weather(element); 
        weatherArray.push(getWeather);
    });
    
    res.send(weatherArray);
})

// [
//     {
//       "forecast": "Partly cloudy until afternoon.",
//       "time": "Mon Jan 01 2001"
//     },
//     {
//       "forecast": "Mostly cloudy in the morning.",
//       "time": "Tue Jan 02 2001"
//     },
//   ]

function Weather (weatherData) {
    this.forecast =weatherData.weather.description ;
    this.time = new Date(weatherData.datetime).toString().slice(0,15) ;
}


server.get('*',(req,res)=>{
    // {
    //     status: 500,
    //     responseText: "Sorry, something went wrong",
    //     ...
    //   }
    let errorObj = {
        status: 500,
        responseText: "Sorry, something went wrong"
    }
    res.status(500).send(errorObj);
})
