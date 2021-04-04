'use strict';

const express=require('express');
require('dotenv').config();
const server=express();

const PORT=process.env.PORT || 4000;

server.listen(PORT,() =>{
    console.log(`hello PORT ${PORT}`)
});

 server.get('/test',(req,res)=>{
     res.send('HERE WE GO');
 });



