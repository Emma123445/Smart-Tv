const  express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); 
const dotenv = require('dotenv');
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const movieRoute = require("./routes/movies");
const verifyToken = require("./verifyToken");

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, 
}).then(() => {
  console.log('Connexion à MongoDB réussire');
}).catch(err => {
  console.error('Erreur de connection à MongoDB:', err);
});

 
app.use(cors(
  {
  origin: 'http://localhost:5173',
  credentials: true
}
));
app.use(express.json());
app.use("/api/auth", authRoute); 
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);


app.listen(5000, () => {
  console.log('Server backend est bien lancé sur le port 5000');
}); 
// mongodb+srv://emmanuellasodabi30:ULJGZHukPDi9LZoG@cluster0.mau6xet.mongodb.net/