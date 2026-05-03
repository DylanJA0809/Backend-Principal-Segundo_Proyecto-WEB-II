const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Genera un código de 6 dígitos aleatorio.
 */
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envía un SMS con el código 2FA al número indicado.
 * @param {string} to - Número de teléfono del usuario (ej: +50688887777)
 * @param {string} code - Código de 6 dígitos
 */
const sendSMS = async (to, code) => {
    await client.messages.create({
        body: `Tu código de verificación de TicoAutos es: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
    });
};

module.exports = { generateCode, sendSMS };
