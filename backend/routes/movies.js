const router = require("express").Router();
const movie = require("../models/Movie");
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
            const updatedMovie = await Movie.findByIdAndUpdate(req.params.id,
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
            await Movie.findByIdAndDelete(req.params.id);
            res.status(200).json("Film supprimé avec succès");
        } catch (err) {
            res.status(500).json(err);
        } 
    } else {
        res.status(403).json("Vous ne pouvez pas supprimer ce film");
    }
    
});

//get movie
router.get("/:id", verifyToken, async (req, res)=>{
        try {
           const movie = await Movie.findById(req.params.id);
            res.status(200).json(movie);
        } catch (err) {
            res.status(500).json(err);
        }    
    
});

//get Random movie
router.get("/random", verifyToken, async (req, res)=>{
    const type = req.query.type;
    let movie;
        try {
            if (type === "series") {
                movie = await Movie.aggregate([
                    { $match: { isSeries: true } },
                    { $sample: { size: 1 } }
                ]);  
            } else {
                movie = await Movie.aggregate([
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