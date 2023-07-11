'use strict';

const key = 'b186afe85fabe53c8ab91946ad3d3d94';

export const fetchData = async (URL, callback) => {
  try {
    const res = await fetch(`${URL}&appid=${key}`);
    if (!res.ok) {
      throw new Error('Failed to fetch data. Network response was not ok');
    }
    const data = await res.json();
    callback(data);
  } catch (error) {
    throw error;
  }
};

export const url = {
  currentWeather: (lat, lon) =>
    `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`,

  forecast: (lat, lon) =>
    `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`,

  airPollution: (lat, lon) =>
    `http://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`,

  reverseGeo: (lat, lon) =>
    `http://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`,

  geo: query =>
    `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`,
};
