const  express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); 
const dotenv = require('dotenv');
const authRoute = require("./routes/auth");

dotenv.config();


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
}).then(() => {
  console.log('Connexion à MongoDB réussire');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);


app.listen(5000, () => {
  console.log('Server is running on port 5000');
}); 
// mongodb+srv://emmanuellasodabi30:ULJGZHukPDi9LZoG@cluster0.mau6xet.mongodb.net/