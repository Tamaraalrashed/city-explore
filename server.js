'use strict';
//DOTENV (read our environment variable)
require('dotenv').config();

// Application Dependencies
const express=require('express');
//CORS = Cross Origin Resource Sharing
const cors = require('cors');
// client-side HTTP request library
const superagent=require('superagent')
//
const pg=require('pg');


const axios = require('axios');

// Application Setup
const app=express();
const PORT=process.env.PORT || 4000;
const client = new pg.Client({ connectionString: process.env.DATABASE_URL});
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
app.use(cors());


// Routes
app.get('/', homeHandler);
app.get('/location', locationHandler);
app.get('/weather',weatherHandler);
app.get('/parks', parksHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);




//handlers
function homeHandler(req,res){
res.status(200).send('Good to reach here!!!')
}
//http://localhost:3000/location?city=amman
function locationHandler (req,res){
    console.log(req.query);
    let cityName=req.query.city;
    console.log(cityName); 
let SQL=`SELECT DISTINCT * FROM locations WHERE search_query=$1`
let safeValues=[cityName];
client.query(SQL,safeValues)
.then(dataBaseData=>{
    // console.log(dataBaseData);
    if(dataBaseData.rowCount>0){
        let dbData=dataBaseData.rows[0];
        // console.log('hereh :', dbData)
        let getLocation =new Location(cityName, dbData);
        res.send(getLocation);
    }
    else{
        let key=process.env.KEY_LOCATION;
        let URL=`https://eu1.locationiq.com/v1/search.php?key=${key}&q=${cityName}&format=json`
        superagent.get(URL)
        .then(getData=>{ 
            let gData=getData.body;
            let SQL1=  `INSERT INTO locations VALUES($1,$2,$3,$4) RETURNING *;`
let safeValues1=[cityName, gData[0].display_name, gData[0].lat, gData[0].lon];
client.query(SQL1,safeValues1)
.then( locationDB=>{
    let locationDB1 =new Location(locationDB.rows[0].search_query,locationDB.rows[0]); 
    res.send(locationDB1);
})
 }) 
    }
});
}

//http://localhost:3000/weather?search_query=amman&formatted_query=Amman%2C%2011181%2C%20Jordan&latitude=31.9515694&longitude=35.9239625&page=1
function weatherHandler (req,res){
    // console.log(req.query);
    let cityName=req.query.search_query;
    let key=process.env.KEY_WEATHER;
    let URL=`https://api.weatherbit.io/v2.0/forecast/daily?city=${cityName}&key=${key}&day=[8]` 
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
    // console.log(parksArray);
    res.send(parksArray);
})
.catch(error=>{
    res.send(error)

});   
}
//https://tamara-city-explorer.herokuapp.com/movies?search_query=seattle&formatted_query=Seattle%2C%20King%20County%2C%20Washington%2C%20USA&latitude=47.60383210000000&longitude=-122.33006240000000&page=1
function moviesHandler(req,res){
 let cityName=req.query.search_query;
// console.log('moviesquery', req.query);   
let key=process.env.KEY_MOVIES;
 let URL=`https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${cityName}`
superagent.get(URL)
.then(moviesData=>{
//    console.log('moviesData', moviesData.body.results);
  let moviesDataArr= moviesData.body.results.map((item)=>{
let getMovies= new Movies (item);
return getMovies;
  });
//   console.log('moviesDataArr', moviesDataArr);
  res.send(moviesDataArr);

})
.catch(error=>{
    res.send(error)
});
 }
 

//  https://api.yelp.com/v3/businesses/search?location=bostonBearer1DsqToPZVKdLTYeVJ36zq4Puu8OTRlBwHs506_pyvT_CG71nhzXEIp28hGisg0KXi2UK7XtFg3CTPzhKAVgRYaKitZGX1bsWtV5yUNPOoQcndiISz4Ng2HkNYNBtYHYx

 function yelpHandler (req,res){
    let cityName=req.query.search_query;
    // console.log('yelpquery', req.query);   
    let key=process.env.KEY_YELP;
    // let authorization=`Bearer ${key}`;
    // let URL=`https://api.yelp.com/v3/businesses/search?location=${cityName}`
    // let yelpREST = axios.create({
    //     baseURL: 'https://api.yelp.com/v3',
    //     headers: {
    //       Authorization: `Bearer ${key}`,
    //       "Content-type": "application/json",
    //     },
    //   });
    //   yelpREST('/businesses/search', {
    //     params: {
    //       location: `${cityName}`
         
    //     },
    // })
    let numberInPage=5;
    // let URL=`https://api.yelp.com/v3/businesses/search?location=${cityName}&limit=${numberInPage}&offset=${start}`;
    let URL=`https://api.yelp.com/v3/businesses/search?location=${cityName}`;
  superagent.get(URL)
    .set('Authorization', `Bearer ${key}`)
    .then(yelpData=>{
        // console.log('yelpData', yelpData.body);
        let yelpDataArr= yelpData.body. businesses.map((item)=>{
            let getYelp= new Yelp (item);
            return getYelp;
              });
            //   console.log('yelpDataArr', yelpDataArr);
              res.send(yelpDataArr);
            
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
    this.formatted_query=locationData.formatted_query;
    this.latitude=locationData.latitude;
    this.longitude=locationData.longitude;
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

function Parks (parksData) {
    this.name = parksData.fullName ;
    this.address=`${parksData.addresses[0].line1}, ${parksData.addresses[0].city}, ${parksData.addresses[0].stateCode} ${parksData.addresses[0].postalCode}`;
    this.fee=parksData.entranceFees[0].cost;
    this.description=parksData.description;
    this.url=parksData.url;

} 

// [
//     {
//       "title": "Sleepless in Seattle",
//       "overview": "A young boy who tries to set his dad up on a date after the death of his mother. He calls into a radio station to talk about his dad’s loneliness which soon leads the dad into meeting a Journalist Annie who flies to Seattle to write a story about the boy and his dad. Yet Annie ends up with more than just a story in this popular romantic comedy.",
//       "average_votes": "6.60",
//       "total_votes": "881",
//       "image_url": "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg",
//       "popularity": "8.2340",
//       "released_on": "1993-06-24"
//     },

function Movies (getMovies){
    this.title=getMovies.original_title;
    this.overview=getMovies.overview;
    this.average_votes=getMovies.vote_average;
    this.total_votes=getMovies.vote_count;
    this.image_url=`https://image.tmdb.org/t/p/w500/${getMovies.poster_path}`;
    this.popularity=getMovies.popularity;
    this.released_on=getMovies.release_date;
}

// {
//     "name": "Pike Place Chowder",
//     "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
//     "price": "$$   ",
//     "rating": "4.5",
//     "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
//   },


 function Yelp (getYelp){
 this.name= getYelp.name;
  this.image_url=getYelp. image_url;
  this.price=getYelp.price;
  this.rating=getYelp.rating; 
  this.url=getYelp.url; 
}

app.get('*',(req,res)=>{
    let errorObj = {
        status: 500,
        responseText: "Sorry, something went wrong"
    }
    res.status(500).send(errorObj);
})

client.connect()
.then(()=>{
    app.listen(PORT,() =>{
        console.log(`hello PORT ${PORT}`)
    });
})



