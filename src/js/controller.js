'use strict';

import { url } from './api.js';
import { updateWeather, error404, showLoading } from './view.js';
const defaultLocation = '#/weather?lat=51.5073219&lon=-0.1276474'; // London

const currentLocation = function () {
  window.navigator.geolocation.getCurrentPosition(
    res => {
      const { latitude, longitude } = res.coords;

      showLoading();
      updateWeather(`lat=${latitude}`, `lon=${longitude}`);
    },
    err => {
      window.location.hash = defaultLocation;
    }
  );
};

const searchedLocation = query => updateWeather(...query.split('&'));

const routes = new Map([
  ['/current-location', currentLocation],
  ['/weather', searchedLocation],
]);

const checkHash = function () {
  const requestURL = window.location.hash.slice(1);

  const [route, query] = requestURL.includes('?')
    ? requestURL.split('?')
    : [requestURL];

  routes.get(route) ? routes.get(route)(query) : error404();
};

window.addEventListener('hashchange', checkHash);

window.addEventListener('load', function () {
  if (!window.location.hash) {
    window.location.hash = '#/current-location';
  } else {
    checkHash();
  }
});
