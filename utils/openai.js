const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "TicoAutos"
  }
});

async function containsContactInfo(text) {
  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Eres un moderador de mensajes para una plataforma de venta de autos. " +
            "Tu única tarea es determinar si el mensaje del usuario contiene información de contacto personal: " +
            "números de teléfono, correos electrónicos, usuarios de redes sociales (WhatsApp, Instagram, Telegram, etc.), " +
            "direcciones físicas o cualquier otro dato que permita contacto fuera de la plataforma. " +
            "Responde ÚNICAMENTE con la palabra YES si contiene información de contacto, o NO si no la contiene.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 5,
      temperature: 0,
    });

    const answer = response.choices[0].message.content.trim().toUpperCase();
    return answer === "YES";
  } catch (err) {
    console.error("OpenAI error:", err.message);
    return false;
  }
}

module.exports = { containsContactInfo };