const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token manquant" });

    if (!authHeader.startsWith("Bearer "))
      return res.status(400).json({ message: "Format token invalide" });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError")
          return res.status(401).json({ message: "Token expiré" });
        return res.status(403).json({ message: "Token invalide" });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    console.error("Erreur verifyToken :", err);
    res.status(500).json({ message: "Erreur vérification token" });
  }
}

module.exports = verifyToken;
