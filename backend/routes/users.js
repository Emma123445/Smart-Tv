const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const verifyToken = require("../verifyToken");


//UPDATE USER
router.put("/:id", verifyToken, async (req, res)=>{
    if (req.user.id === req.params.id || req.user.isAdmin) {
        if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
        }
    
        try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, 
        {
            $set: req.body,
        }, { new: true });
    
        res.status(200).json("utisateur mis à jour avec succès");
        } catch (err) {
        res.status(500).json(err);
        }
    } else {
        res.status(403).json("Vous ne pouvez pas mettre à jour cet utilisateur");
    }
});

//DELETE
router.delete("/:id", verifyToken, async (req, res)=>{
    if (req.user.id === req.params.id || req.user.isAdmin) {
        try {
         await User.findByIdAndDelete(req.params.id);
    
        res.status(200).json("Utisateur supprimé avec succès");
        } catch (err) {
        res.status(500).json(err);
        }
    } else {
        res.status(403).json("Vous ne pouvez pas supprimer cet utilisateur");
    }
});

//GET
router.get("/find/:id", async (req, res)=>{
    
        try {
        const user = await User.findById(req.params.id);
        const { password, ...info } = user._doc;
        res.status(200).json(info);
        } catch (err) {
        res.status(500).json(err);
        }
    });

//GET ALL
router.get("/", verifyToken, async (req, res)=>{
    const query = req.query.new;
    if (req.user.isAdmin) {
        try {
         const users = query ? await User.find().sort({_id:-1}).limit(10) : await User.find();
        res.status(200).json(users);
        } catch (err) {
        res.status(500).json(err);
        }
    } else {
        res.status(403).json("Vous n'êtes pas autorisé à voir tous les utilisateurs");
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