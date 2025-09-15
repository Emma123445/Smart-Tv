const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Register 
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
  });

  try { 
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json("Utilisateur introuvable");
    }

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
  
    if (originalPassword !== req.body.password) {
      return res.status(401).json("Mot de passe incorrect");
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    const { password, ...info } = user._doc;
    res.status(200).json({ ...info, accessToken });

  } catch (err) {
  console.log("Erreur lors du login :", err); // Ajoute ce log
  res.status(500).json("Erreur serveur");     // Reste plus clair pour le client
}
});



module.exports = router;