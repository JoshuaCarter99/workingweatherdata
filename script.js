var searchButton = document.querySelector('#searchbtn');
var searchText = document.querySelector('#textinput');
var localHistory = document.querySelector('#history');
var currentWeather = document.querySelector('#today');
var fivedayWeather = document.querySelector('#fiveday');
var cityName = '';
var lat;
var lon;
var cities;

function setCities() {
  cities = JSON.parse(localStorage.getItem('cities'));

  if (cities === null) {
    cities = [];
  }
}

function storeCityData() {
  var cityData = {
    name: cityName,
    latitude: lat,
    longitude: lon
  }
  
  if (!cities.some(el => el.name === cityName)) {
    cities.push(cityData);

    localStorage.setItem('cities', JSON.stringify(cities));

    displaySearchHistory()
  }
}

function displaySearchHistory() {
  localHistory.innerHTML = '';
  
  if (cities) {
    cities.forEach(cityInfo => {
      var li = document.createElement('li');
      
      li.setAttribute('class', 'btn')
      li.setAttribute('data-name', cityInfo.name);

      li.textContent = cityInfo.name;

      localHistory.appendChild(li);
    });
  }
}

function displayCurrentForecast(weatherData) {
  currentWeather.innerHTML = '';
  
  var temp = weatherData.temp;
  var wind = weatherData.wind;
  var humid = weatherData.humidity;
  var date = weatherData.date;
  var icon = weatherData.icon;

  var cityTitle = document.createElement('h2');
  var img = document.createElement('img');
  var tempToday = document.createElement('p');
  var windToday = document.createElement('p');
  var humidToday = document.createElement('p');

  cityTitle.textContent = cityName + date;
  img.setAttribute('src', 'http://openweathermap.org/img/wn/' + icon + '.png');
  tempToday.textContent = 'Temperature: ' + temp + '°F';
  windToday.textContent = 'Wind: ' + wind + ' MPH';
  humidToday.textContent = 'Humidity: ' + humid + '%';

  cityTitle.appendChild(img);
  currentWeather.appendChild(cityTitle);
  currentWeather.appendChild(tempToday);
  currentWeather.appendChild(windToday);
  currentWeather.appendChild(humidToday);
}

function displayWeekForecast(forecastData) {
  fivedayWeather.innerHTML = '';
  
  for (var i = 7; i < forecastData.length; i += 8) {
    var temp = forecastData[i].main.temp;
    var wind = forecastData[i].wind.speed;
    var humid = forecastData[i].main.humidity;
    var date = dayjs.unix(forecastData[i].dt).format(' MMM DD, YYYY');
    var icon = forecastData[i].weather[0].icon;

    
    var li = document.createElement('li');
    var newDate = document.createElement('h2');
    var img = document.createElement('img');
    var newTemp = document.createElement('p');
    var newWind = document.createElement('p');
    var newHumid = document.createElement('p');

    newDate.textContent = date;
    img.setAttribute('src', 'http://openweathermap.org/img/wn/' + icon + '.png');
    newTemp.textContent = 'Temp: ' + temp + '°F';
    newWind.textContent = 'Wind: ' + wind + ' MPH';
    newHumid.textContent = 'Humidity: ' + humid + '%';

    
    li.appendChild(newDate);
    li.appendChild(img);
    li.appendChild(newTemp);
    li.appendChild(newWind);
    li.appendChild(newHumid);
    fivedayWeather.appendChild(li);
  }
}

function getFiveDayForecast() {
  var fivedayLink = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=7930060f49cd53c05bdb6d2aa062b86d' + '&units=imperial';

  fetch(fivedayLink)
    .then(function (response) {
      
      if(response.status === 200) {
        return response.json();
      }
    })
    .then(function (data) {
      displayWeekForecast(data.list);
      cityName = '';
    });
}

function getCityWeather(event) {
  var forecast = {};
  if (cityName === '' && searchText.value !== '') {
    event.preventDefault();

    cityName = searchText.value;
  }
    
  var todayLink = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=7930060f49cd53c05bdb6d2aa062b86d' + '&units=imperial';

  fetch(todayLink)
    .then(function (response) {
      if(response.status === 200) {
        return response.json();
      }
    })
    .then(function (data) {
      forecast['date'] = dayjs.unix(data.dt).format(' MMM DD, YYYY');
      forecast['icon'] = data.weather[0].icon;
      forecast['temp'] = data.main.temp;
      forecast['wind'] = data.wind.speed;
      forecast['humidity'] = data.main.humidity;

      lat = data.coord.lat;
      lon = data.coord.lon;
      
      displayCurrentForecast(forecast);
      
      storeCityData();
      getFiveDayForecast();
    });
}

function getCityData(event) {
  cityName = event.target.dataset.name;
  lat = event.target.dataset.latitude;
  lon = event.target.dataset.longitude;

  getCityWeather(event);
}

setCities();
displaySearchHistory();

searchButton.addEventListener('click', getCityWeather);
localHistory.addEventListener('click', getCityData);