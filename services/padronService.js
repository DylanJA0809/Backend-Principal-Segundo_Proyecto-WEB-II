const Padron = require('../models/padron');

async function getPersonaByCedula(cedula) {
  const cedulaNum = Number(cedula);

  console.log("CEDULA INPUT:", cedula);
  console.log("CEDULA NUM:", cedulaNum);

  const persona = await Padron.findOne({
    CEDULA: cedulaNum
  });

  console.log("RESULTADO:", persona);
  const all = await Padron.find().limit(3);
  console.log("MUESTRA DB:", all);

  return persona;
}

module.exports = { getPersonaByCedula };