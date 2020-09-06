const axios = require('axios');
const Discord = require('discord.js');
const schedule = require('node-schedule');
const client = new Discord.Client();

const dotenv = require('dotenv');
dotenv.config();

const kakaoAPIKey = process.env.kakaoAPIKey;
const weatherAPIKey = process.env.weatherAPIKey;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Time for which you want to be notified using Cron Table
const every8AM = "* * 8 * * *";

let lon, lat, location, job;

//Geocoding function
function getCoord(location){
  const locationURI = encodeURI(location);
  return axios.get(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${locationURI}`,
    {headers: {
        Authorization: `KakaoAK ${kakaoAPIKey}`
      }
    }
  )
  .then((response) => {
      console.log(response.data.documents[0]);
      lon = response.data.documents[0].address.x;
      lat = response.data.documents[0].address.y;

      // console.log('Coordinate is ' + String(lat) + ', ' + String(lon));
    },
    (error) => {
      console.log(error);
    }
  );
}

// Get weather data function
function getWeather(lat, lon){
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}`;

  return axios.get(url).then(function(response){
      return response.data;
  })
}

// When a message is entered
client.on('message', async msg => {
  //Set location
  if (msg.content.split(' ')[0] === 'location')
  {
    location = msg.content.split(' ')[1];
    await getCoord(location);
    msg.reply(`Set ${location} to location.`);
  }
  // Print weather and temperature
  else if (msg.content === 'weather')
  {
    if(location) //location is exist
    {
      let weatherData = await getWeather(lat, lon);
      msg.reply("The weather in" + location +" is " + String(weatherData.weather[0].main));
      msg.reply("The temperature in " + location +" is " + String(Math.floor(weatherData.main.temp - 273)) + " degrees Celsius");
    }
    else
    {
      //location == null
      msg.reply("Please set the location first.");
    }
  }
  //Start notification
  else if (msg.content === 'start')
  {
    if(location) 
    {
      msg.reply('Start notification.');
      job = schedule.scheduleJob(every8AM, async function(){
        let weatherData = await getWeather(lat, lon);

        msg.reply("The weather in" + location +" is " + String(weatherData.weather[0].main));
        msg.reply("The temperature in " + location +" is " + String(Math.floor(weatherData.main.temp - 273)) + " degrees Celsius");
      })
    }
    else
    {
      //location == null
      msg.reply("Please set the location first.");
    }
  }
  // Exit notification
  else if (msg.content === 'exit')
  {
    msg.reply("Exit notification.");
    job.cancel();
  }
});

client.login(process.env.token);
