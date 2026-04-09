const mongoose = require('mongoose');

const padronConnection = mongoose.createConnection(
  process.env.PADRON_DATABASE_URL
);

padronConnection.on("connected", () => {
  console.log("🟢 PADRON conectado");
});

padronConnection.on("error", (err) => {
  console.error("🔴 PADRON error:", err);
});

module.exports = padronConnection;