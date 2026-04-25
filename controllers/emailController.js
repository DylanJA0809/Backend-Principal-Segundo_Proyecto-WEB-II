const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendActivationEmail = async (email, token) => {
  const activationLink = `${process.env.FRONTEND_URL}/II_Proyecto_Frontend/Frontend-Segundo_Proyecto-WEB-II/HTML/activate.html?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM,
    subject: "Activa tu cuenta en TicoAutos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e53e3e;">Bienvenido a TicoAutos</h2>
        <p>Gracias por registrarte. Para activar tu cuenta haz click en el botón:</p>
        <a href="${activationLink}" 
           style="background-color: #e53e3e; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 8px; display: inline-block;">
          Activar cuenta
        </a>
        <p style="margin-top: 20px; color: #666;">
          Si no te registraste en TicoAutos, ignora este correo.
        </p>
      </div>
    `
  };

  await sgMail.send(msg);
};

module.exports = { sendActivationEmail };