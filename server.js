'use strict';
//DOTENV (read our environment variable)
require('dotenv').config();

// Application Dependencies
const express=require('express');
//CORS = Cross Origin Resource Sharing
const cors = require('cors');
// client-side HTTP request library
const superagent=require('superagent')

// Application Setup
const app=express();
const PORT=process.env.PORT || 4000;
app.use(cors());


// Routes
app.get('/', homeHandler);
app.get('/location', locationHandler);
app.get('/weather',weatherHandler);
 app.get('/parks', parksHandler);
 app.get('*', parksHandler);

function homeHandler(req,res){
res.status(200).send('Good to reach here!!!')
}
//http://localhost:3000/location?city=amman
function locationHandler (req,res){
    console.log(req.query);
    let cityName=req.query.city;
    console.log(cityName);
    let key=process.env.KEY_LOCATION;
    let URL=`https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`
    // console.log('before superagent');
    superagent.get(URL)
    .then(getData=>{
        // console.log('inside superagent'); 
        let gData=getData.body;
        let getLocation =new Location(cityName, gData);
        res.send(getLocation);
    })
}
// console.log('after superagent'); 

//http://localhost:3000/weather?search_query=amman&formatted_query=Amman%2C%2011181%2C%20Jordan&latitude=31.9515694&longitude=35.9239625&page=1
function weatherHandler (req,res){
    // console.log(req.query);
    let cityName=req.query.search_query;
    let key=process.env.KEY_WEATHER;
    let URL=`https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}` 
    superagent.get(URL)
    .then(getData=>{
        let gData=getData.body;
        let weatherArray= gData.data.map((item)=>{
            let getWeather= new Weather(item); 
            return getWeather;
    });  
    res.send(weatherArray);
})
.catch(error=>{
    res.send(error)

});   
}

function parksHandler(req,res){
    console.log(req.query);   
     let cityName=req.query.search_query;
     let key=process.env.KEY_PARKS;
     let URL=`https://developer.nps.gov/api/v1/parks?q=${cityName}&api_key=${key}`
     superagent.get(URL)
     .then(getData=>{
        let gData=getData.body;
        let parksArray= gData.data.map((item)=>{
            let getParks= new Parks(item); 
            return getParks;
    });  
    console.log(parksArray);
    res.send(parksArray);
})
.catch(error=>{
    res.send(error)

});   
}
// {
//   "search_query": "seattle",
//   "formatted_query": "Seattle, WA, USA",
//   "latitude": "47.606210",
//   "longitude": "-122.332071"
// }
//constructors
function Location (cityName,locationData) {
    this.search_query = cityName ;
    this.formatted_query=locationData[0].display_name;
    this.latitude=locationData[0].lat;
    this.longitude=locationData[0].lon;

}



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

//   {
//      "name": "Klondike Gold Rush - Seattle Unit National Historical Park",
//      "address": "319 Second Ave S., Seattle, WA 98104",
//      "fee": "0.00",
//      "description": "Seattle flourished during and after the Klondike Gold Rush. Merchants supplied people from around the world passing through this port city on their way to a remarkable adventure in Alaska. Today, the park is your gateway to learn about the Klondike Gold Rush, explore the area's public lands, and engage with the local community.",
//      "url": "https://www.nps.gov/klse/index.htm"
//     },


// "postalCode": "98104",
// "city": "Seattle",
// "stateCode": "WA",
// "line1": "319 Second Ave S."
function Parks (parksData) {
    this.name = parksData.fullName ;
    this.address=`${parksData.addresses[0].line1}, ${parksData.addresses[0].city}, ${parksData.addresses[0].stateCode} ${parksData.addresses[0].postalCode}`;
    this.fee=parksData.entranceFees[0].cost;
    this.description=parksData.description;
    this.url=parksData.url;

} 





app.get('*',(req,res)=>{
    let errorObj = {
        status: 500,
        responseText: "Sorry, something went wrong"
    }
    res.status(500).send(errorObj);
})
app.listen(PORT,() =>{
    console.log(`hello PORT ${PORT}`)
});

