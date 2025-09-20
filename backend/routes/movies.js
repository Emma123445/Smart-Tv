const router = require("express").Router();
const movie = require("../models/Movie");
const mongoose = require("mongoose");
const User = require("../models/User");
const verifyToken = require("../verifyToken");


//Create new movie
router.post("/", verifyToken, async (req, res)=>{
    if (req.user.isAdmin) {
        const newMovie = new movie(req.body);
        try {
            const savedMovie = await newMovie.save();
            res.status(201).json(savedMovie);
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("Vous ne pouvez pas créer un film");
    }
});

//Update movie
router.put("/:id", verifyToken, async (req, res)=>{
    if (req.user.isAdmin) {
        try {
            const updatedMovie = await movie.findByIdAndUpdate(req.params.id,
                {
                $set: req.body, 
            },
            { new: true }
            );
            res.status(200).json(updatedMovie);
        } catch (err) {
            res.status(500).json(err);
        } 
    } else {
        res.status(403).json("Vous ne pouvez pas créer un film");
    }
    
});

//delete movie
router.delete("/:id", verifyToken, async (req, res)=>{
    if (req.user.isAdmin) {
        try {
            await movie.findByIdAndDelete(req.params.id);
            res.status(200).json("Film supprimé avec succès");
        } catch (err) {
            res.status(500).json(err);
        } 
    } else {
        res.status(403).json("Vous ne pouvez pas supprimer ce film");
    }
    
});

//get movie
router.get("/find/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  console.log("GET /api/movies/find/:id — id:", id);

  try {
    // Vérif ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide (24 hex chars attendus)" });
    }

    // Vérif connexion Mongo
    if (mongoose.connection.readyState !== 1) {
      console.error("MongoDB not connected — readyState:", mongoose.connection.readyState);
      return res.status(503).json({ error: "Base de données non disponible" });
    }

    // Requête (lean évite certains soucis de sérialisation)
    const movie = await movie.findById(id).lean();
    if (!movie) return res.status(404).json({ error: "Film introuvable" });

    res.status(200).json(movie);
  } catch (err) {
    // Affiche la stack claire en console pour debug
    console.error("Erreur GET /find/:id :", err);
    // En prod renvoie un message générique ; en dev tu peux renvoyer err.message
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

//get Random movie
router.get("/random", verifyToken, async (req, res)=>{
    const type = req.query.type;
    let movie;
        try {
            if (type === "series") {
                movie = await movie.aggregate([
                    { $match: { isSeries: true } },
                    { $sample: { size: 1 } }
                ]);  
            } else {
                movie = await movie.aggregate([
                    { $match: { isSeries: false } },
                    { $sample: { size: 1 } }
                ]);   
            }
            res.status(200).json(movie[0]);
        } catch (err) {
            res.status(500).json(err);
        }    
    
});

// GET USER STATS
router.get("/stats", verifyToken, async (req, res) => {
    const today = new Date();
    const lastYear = new Date(today.setFullYear(today.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            // On ne garde que les utilisateurs créés depuis un an
            { 
                $match: { createdAt: { $gte: lastYear } }
            },
            // On extrait le mois à partir de la date de création
            {
                $project: {
                    month: { $month: "$createdAt" }
                }
            },
            // On regroupe par mois et on compte
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 }
                }
            },
            // On trie les mois dans l’ordre croissant
            {
                $sort: { _id: 1 }
            }
        ]);

        // Tableau des mois pour transformer 1 → Jan, 2 → Feb...
        const monthsArray = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // On remplace l’ID numérique par l’abréviation du mois
        const formattedData = data.map(item => ({
            month: monthsArray[item._id - 1],
            total: item.total
        }));

        res.status(200).json(formattedData);
    } catch(err) {
        res.status(500).json(err);
    }
});

module.exports = router;