'use strict';

import { fetchData, url } from './api.js';
import * as module from './model.js';
import iconToImageMap from './image.js';

// Elements
const searchView = document.querySelector('.search');
const searchToggles = document.querySelectorAll('[data-search-toggler]');
const searchInput = document.querySelector('.search__input');
const searchResult = document.querySelector('.search__result');
const container = document.querySelector('.container');
const containerArticle = document.querySelector('[data-container]');
const loading = document.querySelector('.loading');
const currentLocationBtn = document.querySelector(
  '[data-current-location-btn]'
);
const mainElement = document.querySelector('.main');
const errorContent = document.querySelector('[data-error-content]');
const currentWeatherSection = document.querySelector('.current-weather');
const forecastSection = document.querySelector('.forecast');
const highlightSection = document.querySelector('.highlights');
const hourlySection = document.querySelector('.hourly-forcast');
const footerSection = document.querySelector('.footer');

//Utility function to add event listeners to multiple elements
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

// Toggle search in mobile devices
const toggleSearch = () => {
  searchView.classList.toggle('active');

  if (searchView.classList.contains('active')) {
    mainElement.style.opacity = '0';
    mainElement.style.visibility = 'hidden';
  } else {
    mainElement.style.opacity = '1';
    mainElement.style.visibility = 'visible';
  }
};
addEventOnElements(searchToggles, 'click', toggleSearch);

// Search integration
let searchTimeout = null;
const searchTimeoutDuration = 500;

searchInput.addEventListener('input', function () {
  searchTimeout ?? clearTimeout(searchTimeout);

  if (!searchInput.value) {
    searchResult.classList.remove('active');
    searchResult.innerHTML = '';
    searchInput.classList.remove('searching');
  } else {
    searchInput.classList.add('searching');
  }

  if (searchInput.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geo(searchInput.value), function (locations) {
        searchInput.classList.remove('searching');
        searchResult.classList.add('active');
        searchResult.innerHTML = `
      <ul class="search__result--list"></ul>
    `;

        const list = searchResult.querySelector('.search__result--list');

        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement('li');
          searchItem.classList.add('search__result--item');

          searchItem.innerHTML = `
        <i class="ph ph-map-pin"></i>
        <div>
          <p class="search__result--item-title">${name}</p>
          <p class="label-2 search__result--item-subtitle">
            ${state || ''} ${country}
          </p>
        </div>
        <a href="#/weather?lat=${lat}&lon=${lon}"
          class="search__result--item-link has-state"
          aria-label="${name} weather"
          data-search-toggler></a>
      `;

          const link = searchItem.querySelector('[data-search-toggler]');
          link.addEventListener('click', function (event) {
            event.preventDefault();
            searchResult.classList.remove('active');
            const target = event.currentTarget.getAttribute('href');
            window.location.href = target;

            // Manually reload the page
            location.reload();

            // Clear input and search result list
            searchInput.value = '';
            searchResult.innerHTML = '';
          });

          list.appendChild(searchItem);
        }
      });
    }, searchTimeoutDuration);
  }
});

// Add event listener to the search result element
searchResult.addEventListener('click', function (e) {
  if (e.target.classList.contains('search__result--item-link')) {
    loading.style.display = 'grid';
    // searchView.classList.remove('active');
    setTimeout(() => toggleSearch(), 300);
  }
});

// Loading
loading.style.display = 'grid';

// Update Weather
export const updateWeather = function (lat, lon) {
  // Render all weather data in html page
  container.classList.remove('fade-in');
  containerArticle.classList.add('fade-in');
  errorContent.style.display = 'none';
  footerSection.style.display = 'none';

  // Clear existing content
  currentWeatherSection.innerHTML = '';
  highlightSection.innerHTML = '';
  hourlySection.innerHTML = '';
  forecastSection.innerHTML = '';

  // Disable Current Location Button
  if (window.location.hash === '#/current-location') {
    currentLocationBtn.setAttribute('disabled', '');
  } else {
    currentLocationBtn.removeAttribute('disabled', null);
  }

  // CURRENT WEATHER SECTION
  fetchData(url.currentWeather(lat, lon), function (currentWeather) {
    const {
      weather: [{ description, icon }],
      main: { temp, feels_like, pressure, humidity },
      visibility,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      timezone,
    } = currentWeather;

    // Get image source based on icon
    const imageSrc = iconToImageMap[icon];

    const card = document.createElement('div');
    card.classList.add('card', 'card__lg', 'current-weather__card');

    card.innerHTML = `<h2 class="title-2 card-title">Now</h2>

                      <div class="wrapper">
                        <p class="heading temperature">
                          ${parseInt(temp)}<span class="entity">&#8451;</span>
                        </p>
                        <img
                          src="${imageSrc}"
                          width="72"
                          height="72"
                          alt="${description}"
                          class="current-weather__icon"
                        />
                      </div>

                      <p class="body-3">${description}</p>

                      <ul class="current-weather__details">
                        <li class="current-weather__details--list">
                          <i class="ph ph-calendar-blank"></i>
                          <p class="title-3 current-weather__details--text">
                            ${module.getDate(dateUnix, timezone)}
                          </p>
                        </li>
                        <li class="current-weather__details--list">
                          <i class="ph ph-map-pin"></i>
                          <p class="title-3 current-weather__details--text" data-location>
                          </p>
                        </li>
                      </ul>`;

    // Fetch reverse geolocation data and update location in card
    fetchData(url.reverseGeo(lat, lon), ([{ name, country }]) => {
      card.querySelector('[data-location]').innerHTML = `${name}, ${country}`;
    });

    currentWeatherSection.appendChild(card);

    // HIGHTLIGH SECTION
    fetchData(url.airPollution(lat, lon), function (airPollution) {
      const [
        {
          main: { aqi },
          components: { no2, o3, so2, pm2_5 },
        },
      ] = airPollution.list;

      const card = document.createElement('div');
      card.classList.add('card', 'card__lg');

      card.innerHTML = `
    <h2 class="title-2" id="highlights-label">Todays Highlights</h2>

    <div class="highlights__list">
      <div class="card card__sm highlights__card one">
        <h3 class="title-3">Air Quality Index</h3>

        <div class="highlights__card--wrapper">
          <i class="ph ph-wind"></i>

          <ul class="highlights__card--list">
            <li class="highlights__card--item">
              <p class="title-1">${pm2_5.toPrecision(3)}</p>

              <p class="label-1">PM<sub>2.5</sub></p>
            </li>

            <li class="highlights__card--item">
              <p class="title-1">${so2.toPrecision(3)}</p>

              <p class="label-1">SO<sub>2</sub></p>
            </li>

            <li class="highlights__card--item">
              <p class="title-1">${no2.toPrecision(3)}</p>

              <p class="label-1">NO<sub>2</sub></p>
            </li>

            <li class="highlights__card--item">
              <p class="title-1">${o3.toPrecision(3)}</p>

              <p class="label-1">O<sub>3</sub></p>
            </li>
          </ul>
        </div>

        <span class="badge aqi-${aqi} label-${aqi}" title="${
        module.aqiText[aqi].message
      }">${module.aqiText[aqi].level}</span>
      </div>

      <div class="card card__sm highlights__card">
        <h3 class="title-3">Sunrise & Sunset</h3>

        <div class="highlights__card--list grid-start">
          <div class="highlights__card--item">
            <i class="ph ph-sun"></i>
            <div>
              <p class="label-1">Sunrise</p>

              <p class="title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>
            </div>
          </div>

          <div class="highlights__card--item">
            <i class="ph ph-moon"></i>

            <div>
              <p class="label-1">Sunset</p>

              <p class="title-1">${module.getTime(sunsetUnixUTC, timezone)}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card card__sm highlights__card">
        <h3 class="title-3">Humidity</h3>

        <div class="highlights__card--wrapper">
          <i class="ph ph-drop"></i>

          <p class="title-1">${humidity}<sub>%</sub></p>
        </div>
      </div>

      <div class="card card__sm highlights__card">
        <h3 class="title-3">Pressure</h3>

        <div class="highlights__card--wrapper">
          <i class="ph ph-waves"></i>

          <p class="title-1">${pressure}<sub>hPa</sub></p>
        </div>
      </div>

      <div class="card card__sm highlights__card">
        <h3 class="title-3">Visibility</h3>

        <div class="highlights__card--wrapper">
          <i class="ph ph-eye"></i>
          <p class="title-1">${visibility / 1000}<sub>km</sub></p>
        </div>
      </div>

      <div class="card card__sm highlights__card">
        <h3 class="title-3">Feels Like</h3>

        <div class="highlights__card--wrapper">
          <i class="ph ph-thermometer"></i>

          <p class="title-1 temperature">
          ${parseInt(feels_like)}<span class="entity">&#8451;</span>
          </p>
        </div>
      </div>
    </div>
    `;

      highlightSection.appendChild(card);
    });
  });

  // FORECAST
  fetchData(url.forecast(lat, lon), function (forecast) {
    const {
      list: forecastList,
      city: { timezone },
    } = forecast;

    // 5 DAYS FORECAST SECTION
    forecastSection.innerHTML = `
    <h2 class="title-1" id="forecast-label">5 Days Forecast</h2>
    <div class="card card__lg forecasts__card">
     <ul class="forcast__card--list">
     </ul>
    </div>`;

    forecastList.forEach((data, index) => {
      if (index < 7 || (index - 7) % 8 !== 0) return;

      const {
        main: { temp_max },
        weather: [{ description, icon }],
        dt_txt,
      } = data;
      const date = new Date(dt_txt);

      // Get image source based on icon
      const imageSrc = iconToImageMap[icon];

      const html = ` <li class="forecast__card--item">
                      <div class="forecast__card--icon-wrapper">
                        <img
                          src="${imageSrc}"
                          width="38"
                          height="38"
                          alt="${description}"
                          class="forecast__card--icon"
                        />

                        <span class="span">
                          <p class="title-2">${parseInt(temp_max)}&deg;</p>
                        </span>
                      </div>
                      <p class="label-1">${date.getDate()} ${
        module.monthNames[date.getMonth()]
      }</p>

                      <p class="label-1">${
                        module.weekDayNames[date.getDay()]
                      }</p>
                    </li>`;

      forecastSection
        .querySelector('.forcast__card--list')
        .insertAdjacentHTML('beforeend', html);
    });

    // 24H FORECAST SECTION
    hourlySection.innerHTML = ` <h2 class="title-2">Today at</h2>

                                <div class="hourly-forcast__slider--container">
                                  <ul class="hourly-forcast__slider--list" data-temp></ul>

                                  <ul class="hourly-forcast__slider--list" data-wind></ul>
                                </div>`;

    forecastList.slice(0, 8).forEach(data => {
      const {
        dt: dateTimeUnix,
        main: { temp },
        weather: [{ description, icon }],
        wind: { deg: windDirection, speed: windSpeed },
      } = data;

      // Get image source based on icon
      const imageSrc = iconToImageMap[icon];

      const htmlTemp = ` <li class="hourly-forcast__slider--item">
                          <div class="card card__sm hourly-forcast__slider--card">
                            <p class="body-3">${module.getHour(
                              dateTimeUnix,
                              timezone
                            )}</p>

                            <img
                              src="${imageSrc}"
                             width="54"
                              loading="lazy"
                              alt=""
                              class="hourly-forcast__weather-icon"
                            />

                            <p class="body-3">${parseInt(temp)}&deg;</p>
                          </div>
                        </li>`;
      hourlySection
        .querySelector('[data-temp]')
        .insertAdjacentHTML('beforeend', htmlTemp);

      const htmlWind = `<li class="hourly-forcast__slider--item">
                         <div class="card card__sm hourly-forcast__slider--card">
                           <p class="body-3">${module.getHour(
                             dateTimeUnix,
                             timezone
                           )}</p>

                           <img
                             src="${iconToImageMap.direction}"
                             width="54"
                            loading="lazy"
                             alt="direction"
                             class="hourly-forcast__weather-icon"
                             style="transform: rotate(${
                               windDirection - 180
                             }deg)"
                           />

                           <p class="body-3">${parseInt(
                             module.mps_to_kmh(windSpeed)
                           )}</p>
                         </div>
                       </li>
                   `;

      hourlySection
        .querySelector('[data-wind]')
        .insertAdjacentHTML('beforeend', htmlWind);
    });

    loading.style.display = 'none';
    container.classList.add('fade-in');
    containerArticle.classList.add('fade-in');
    footerSection.style.display = 'block';
  });
};

export const error404 = () => (errorContent.style.display = 'flex');
