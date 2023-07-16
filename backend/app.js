const express = require('express');
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const app = express();
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();


//connection a MongoDB
// Obtenez les informations sensibles à partir des variables d'environnement
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER;


//connection à MongoDB
mongoose.connect(`mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
  //Permet d'exploiter les req qui contiennent du Json
app.use(express.json());


//limite des requéte = securité anti DoS
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Durée de la fenêtre (1 heure en millisecondes)
  max: 100, // Nombre maximal de requêtes autorisées par fenêtre
  message: 'Trop de requêtes effectuées.'
});

// Utilisation du middleware de rate limiting pour toutes les routes
app.use(limiter);

//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use('/api/books', booksRoutes);
  app.use('/api/auth', userRoutes);
  app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;