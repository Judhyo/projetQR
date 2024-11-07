const express = require("express");
const QRCode = require("qrcode");
const Jimp = require("jimp");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const app = express();
/*------------------------CONNECTION FRONT-------------------------------*/

app.use(express.static("Public"));

//extraction des donnees au formulaire
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Utilisation d'Express pour analyser les requêtes JSON
app.use(express.json());

// Route pour générer un QR code
app.post("/addQr", async (req, res) => {
  let nom = req.body.nom;
  let prenoms = req.body.prenoms;
  let addresse = req.body.addresse;
  let mention = req.body.mention;
  let parcours = req.body.parcours;
  // let matricule
  let matricule = req.body.matricule;
  const { text } = req.query; // Texte à transformer en QR code
  if (!matricule) {
    return res
      .status(400)
      .json({ error: "Veuillez fournir un texte pour générer le QR code." });
  }
  try {
    const qrCode = await QRCode.toDataURL(matricule);
    app.get("/affiche", (req, res) => {
      res.status(200).json({ qrCode });
      //   res.send(`<img src="${qrCode}">`);
    });

    var sql =
      "INSERT INTO information(nom, prenoms, addresse, mention, parcours, matricule, qrCode) VALUES(?,?,?,?,?,?,?)";
    db.query(
      sql,
      [nom, prenoms, addresse, mention, parcours, matricule, qrCode],
      (erreur, resultat) => {
        if (erreur) {
          //   res.status(500).json({ message: "Erreur server" });
          console.log(erreur);
        } else {
          res.status(200).json({ message: "Ajout reussite" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération du QR code." });
    // console.log(error);
  }
  //   console.log(req.body);
});
// affiche data
app.get("/toutDataEtudiant", (req, res, next) => {
  var req = "SELECT * FROM information";
  db.query(req, (erreur, resultat) => {
    if (erreur) {
      // res.status(500).json({message: 'Erruer server'})
      console.log(erreur);
    } else {
      res.status(200).json(resultat);
      //   });
      //   console.log(result);
      //   console.log(resultat);
    }
  });
});
// affiche chaque data
app.get("/chaqueQrCode/:id_etud", (req, res) => {
  var id_etud = req.params.id_etud;

  var req = "SELECT * FROM information WHERE id_etud=?";
  db.query(req, [id_etud], (erreur, resultat) => {
    if (erreur) {
      // res.status(500).json({ message: "Erreur server" });
      console.log(erreur);
    } else {
      res.status(200).json(resultat);
    }
  });
});
// modifier data
app.put("/updateData/:id_etud", async (req, res, next) => {
  var id_etud = req.params.id_etud;
  let nom = req.body.nom;
  let prenoms = req.body.prenoms;
  let addresse = req.body.addresse;
  let mention = req.body.mention;
  let parcours = req.body.parcours;
  let matricule = req.body.matricule;
  if (!matricule) {
    return res
      .status(400)
      .json({ error: "Veuillez fournir un texte pour générer le QR code." });
  }
  try {
    const qrCode = await QRCode.toDataURL(matricule);
    var req =
      "UPDATE information SET nom=?,prenoms=?,addresse=?,mention=?,parcours=?,matricule=?,qrCode=? WHERE id_etud=?";

    db.query(
      req,
      [nom, prenoms, addresse, mention, parcours, matricule, qrCode, id_etud],
      (erreur, resultat) => {
        if (erreur) {
          // return res.status(500).json({ message: "Erreur server" });
          console.log(erreur);
        } else {
          return res.status(200).json({ message: "Modification reussite" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la génération du QR code." });
    // console.log(error);
  }
});
// supprimer data
app.delete("/deleteData/:id_etud", (req, res) => {
  var id_etud = req.params.id_etud;
  var req = "DELETE FROM information WHERE id_etud = ?";

  db.query(req, [id_etud], (erreur, resultat) => {
    if (erreur) {
      return res.status(500).json({ message: "Erreur server" });
    } else {
      return res.status(200).json({ message: "Suprimer avec success" });
    }
  });
});

// Route pour lire un QR code (à partir d'une image)
app.post("/read", async (req, res) => {
  const { imagePath } = req.body; // Chemin d'image

  if (!imagePath) {
    return res.status(400).json({
      error: "Veuillez fournir un chemin d'image pour lire le QR code.",
    });
  }

  try {
    const image = await Jimp.read(imagePath);
    const qr = new QRCodeReader();

    qr.callback = (error, value) => {
      if (error) {
        return res
          .status(500)
          .json({ error: "Erreur lors de la lecture du QR code." });
      }
      res.status(200).json({ text: value.result });
    };

    qr.decode(image.bitmap);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la lecture de l'image." });
  }
});

// Démarrage du serveur
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
