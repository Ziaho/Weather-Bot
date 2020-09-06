const axios = require('axios');
const Discord = require('discord.js');
const schedule = require('node-schedule');
const client = new Discord.Client();

const dotenv = require('dotenv');
dotenv.config();
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const everySecond = "* * * * * *";
const everyMin = "* * * * *";
const every8AM = "* * 8 * * *";

let lon, lat, location, job;
// 메세지가 들어왔을때
client.on('message', async msg => {
  if (msg.content === 'ping') {
      schedule.scheduleJob(everySecond, function()
      {msg.reply('Pong!');})
  }
  else if (msg.content.split(' ')[0] === '위치')
  {
    //위치 설정
    location = msg.content.split(' ')[1];
    await getCoord(location);
    msg.reply(`위치가 ${location}으로 설정되었습니다.`);
  }
  else if (msg.content === '날씨')
  {
    if(location) //location이 있을때
    {
      let weatherData = await getWeather(lat, lon);
      msg.reply(location +"의 날씨는 " + String(weatherData.weather[0].main) + " 입니다.");
      msg.reply(location +"의 기온은 " + String(Math.floor(weatherData.main.temp - 273)) + "도 입니다.");
    }
    else
    {
      //location == null
      msg.reply("위치정보를 먼저 설정해주세요.");
    }
  }

  //알람 시작
  else if (msg.content === '시작')
  {
    if(location) 
    {
      msg.reply('알람 서비스를 시작합니다.');
      job = schedule.scheduleJob(everySecond, async function(){
        let weatherData = await getWeather(lat, lon);

        msg.reply(location +"의 날씨는 " + String(weatherData.weather[0].main) + " 입니다.");
        msg.reply(location +"의 기온은 " + String(Math.floor(weatherData.main.temp - 273)) + "도 입니다.");
      })
    }
    else
    {
      //location == null
      msg.reply("위치정보를 먼저 설정해주세요.");
    }
  }
});

client.login(process.env.token);

const kakaoAPIKey = process.env.kakaoAPIKey;
const weatherAPIKey = process.env.weatherAPIKey;


//좌표 주소 변환 함수
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

      console.log('좌표는' + String(lat) + ', ' + String(lon));
    },
    (error) => {
      console.log(error);
    }
  );
}

// 날씨 얻는 함수
function getWeather(lat, lon){
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherAPIKey}`;

  return axios.get(url).then(function(response){
      // console.log(response.data);
      return response.data;
  })
}

async function print(){
  await getCoord("서천동297-4");
  let weatherData = await getWeather(lat, lon);
  console.log(weatherData.name +"의 날씨는 " + String(weatherData.weather[0].main) + " 입니다.");
  console.log(weatherData.name +"의 기온은 " + String(Math.floor(weatherData.main.temp - 273)) + " 입니다.");
}  