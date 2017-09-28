'use strict';

const crypto = require('crypto');
var fs = require('fs');

const DIRSHA = 2;
const FILESHA = 2;
const FILEEXTENSION = 'db';
const BUCLE = 1714;

let decrypt = (text, password) => {
  let decipher = crypto.createDecipher('aes-256-cbc', password);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

let error = message => {
  return {
    error: true,
    message: message
  };
};

let hash = text => {
  const hash = crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
  return hash;
};
let bucleHash = (clau, numero) => {
  let x;
  let clauTemp = clau;
  for (x = 0; x < numero; x++) {
    clauTemp = hash(clauTemp);
  }
  return clauTemp;
};

let generateResponse = info => {
  return `${info[0]}
${info[1]}
${info[2]}
Districte: ${info[3]}
Secció: ${info[4]}
Mesa: ${info[5]}`;
};

let calculate = (dni, birth, postal_code) => {
  if (dni.length != 6)
    return error('Només necessitem les 5 últimes xifres i la lletra.');

  if (birth.length != 8)
    return error('La data de naixement ha de tenir format AAAAMMDD.');

  if (postal_code.length != 5)
    return error('El codi postal han de ser 5 xifres.');

  const key = dni + birth + postal_code;
  const firstSha256 = hash(bucleHash(key, BUCLE));
  const secondSha256 = hash(firstSha256);
  const dir_ = secondSha256.substring(0, DIRSHA);
  const file_ = secondSha256.substring(DIRSHA, DIRSHA + FILESHA);

  const path = `./db/${dir_}/${file_}.${FILEEXTENSION}`;
  let file = fs
    .readFileSync(path)
    .toString()
    .split('\n');
  let info = null;
  for (let line of file) {
    if (line.substring(0, 60) == secondSha256.substring(4)) {
      info = decrypt(line.substring(60), firstSha256).split('#');
    }
  }
  if (info) return generateResponse(info);
  return error(`Alguna de les dades entrades no és correcta`);
};

module.exports = calculate;
