const { regex } = require('./constants');

function validURL(url) {
  return regex.test(url);
}

module.exports = { validURL };
