'use strict';

require('dotenv').config();
const http = require('http');
const Bot = require('messenger-bot');

const Verify = require('./verify');
const Calc = require('./calculate');

let bot = new Bot({
  token: process.env.FB_PAGE_TOKEN,
  verify: process.env.FB_VERIFY_TOKEN
});

bot.on('error', err => {
  console.log(err.message);
});

const defaultText = `Per conèixer el teu col·legi electoral, envia un missatge amb les teves dades separades per espais i fent servir aquest format: \n
DNI DATA_NAIXEMENT CODI_POSTAL\n\n
Exemple:\n00001714N 01/10/2017 01234`;

let process_request = text => {
  let verify_res = Verify(text);
  if (verify_res.error) {
    return verify_res.message;
  }

  let calc_res = Calc(verify_res.dni, verify_res.birth, verify_res.postal_code);
  if (calc_res.error) {
    return calc_res.message;
  }

  return calc_res;
};

bot.on('message', (payload, reply) => {
  let text = payload.message.text;
  let response = process_request(text);

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err;

    reply({ text: response }, err => {
      if (err) throw err;

      console.log(
        `Replied back to ${profile.first_name} ${profile.last_name}: ${response}`
      );
    });
  });
});

http.createServer(bot.middleware()).listen(3000);
console.log('OnVotar server running at port 3000.');
