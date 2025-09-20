const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
    });

    const savedUser = await newUser.save();

    // Générer token
    const token = jwt.sign(
      { id: savedUser._id, isAdmin: savedUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    // Supprimer mot de passe
    const { password, ...userWithoutPassword } = savedUser._doc;

    res.status(201).json({
      message: "Inscription réussie",
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error("Erreur Register:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    const { password, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error("Erreur Login:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
