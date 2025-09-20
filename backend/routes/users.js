const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verifyToken = require("../verifyToken");

// UPDATE USER
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      const { password, ...userWithoutPassword } = updatedUser._doc;
      res.status(200).json({ message: "Utilisateur mis à jour", user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(403).json({ message: "Action interdite" });
  }
});

// DELETE USER
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(403).json({ message: "Action interdite" });
  }
});

// GET USER BY ID
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const { password, ...info } = user._doc;
    res.status(200).json({ user: info });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET ALL USERS
router.get("/", verifyToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const users = await User.find();
      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  } else {
    res.status(403).json({ message: "Non autorisé" });
  }
});

module.exports = router;
