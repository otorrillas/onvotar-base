'use strict';

const default_error = `Per conèixer el teu col·legi electoral, envia un missatge amb les teves dades separades per espais i fent servir aquest format: \n
DNI DATA_NAIXEMENT CODI_POSTAL\n\n
Exemple:\n00001714N 01/10/2017 01234`;

const DNI_REGEX = /^(\d{8})([A-Z])$/;
const DOB_REGEX = /^(\d{8})([0-9])$/;
const ZIP_REGEX = /^(\d{5})([0-9])$/;

let valid_dni = dni => {
  const dni_letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const letter = dni_letters.charAt(parseInt(dni, 10) % 23);

  return letter == dni.charAt(8);
};

let error = message => {
  return {
    error: true,
    message: message
  };
};

let check_data = text => {
  let raw_dni, raw_birth, raw_postal_code, dni, birth, postal_code;

  let splitted = text.split(' ');
  if (splitted.length != 3) return error(default_error);

  raw_dni = splitted[0];
  raw_birth = splitted[1];
  raw_postal_code = splitted[2];

  dni = raw_dni
    .substring(-6)
    .toUpperCase()
    .replace(/-/g, '');
  if (!dni.match(DNI_REGEX)) error('Revisa el format del DNI');
  if (!valid_dni(dni)) error('La lletra del DNI no coincideix');

  dni = dni.substring(3);

  birth = raw_birth.toUpperCase().replace(/\//g, '');
  if (!birth.match(DOB_REGEX))
    error('Revisa el format de la data de naixement');

  birth = birth.substring(4) + birth.substring(2,4) + birth.substring(0,2);

  postal_code = raw_postal_code.toUpperCase();
  if (!postal_code.match(ZIP_REGEX)) error('Revisa el format del codi postal');

  return { dni, birth, postal_code };
};

module.exports = check_data;
