const mysql = require("mysql2");

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
  host: "localhost", // Hôte de la base de données
  user: "root", // Utilisateur MySQL
  password: "", // Mot de passe MySQL
  database: "qr", // Nom de la base de données
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MySQL.");
});

module.exports = db;
