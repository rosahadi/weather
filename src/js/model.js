'use strict';

export const weekDayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const aqiText = {
  1: {
    level: 'Excellent',
    message:
      'Air quality is excellent, and there is no significant risk of air pollution.',
  },
  2: {
    level: 'Good',
    message: 'Air quality is good, and the air pollution poses minimal risk.',
  },
  3: {
    level: 'Fair',
    message:
      'Air quality is fair; however, certain pollutants may pose a moderate health concern for sensitive individuals.',
  },
  4: {
    level: 'Poor',
    message:
      'Air quality is poor, and the general population may experience health effects due to air pollution.',
  },
  5: {
    level: 'Very Poor',
    message:
      'Air quality is very poor, and there may be emergency conditions with severe health risks for the entire population.',
  },
};

export const getDate = function (dateUnix, timezone) {
  const date = new Date((dateUnix + timezone) * 1000);
  const month = monthNames[date.getUTCMonth()];
  const weekday = weekDayNames[date.getUTCDay()];

  return `${weekday} ${date.getUTCDate()}, ${month}`;
};

export const getTime = function (timeUnix, timezone) {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  const formattedHours = String(hours % 12 || 12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${period}`;
};

export const getHour = function (timeUnix, timezone) {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const period = hours >= 12 ? 'PM' : 'AM';

  return `${hours % 12 || 12} ${period}`;
};

export const mps_to_kmh = function (mps) {
  const kmh = mps / 3.6;
  return kmh;
};

// const unixTimestamp = Math.floor(Date.now() / 1000);
// const timezoneOffset = 10800;
