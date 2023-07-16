// package de cryptage des mdp
const bcrypt = require('bcrypt');
// package pour créer des tokens
const jsonWebToken = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.signup = (req, res, next) => {
    const { email, password } = req.body;

    // Vérification de l'e-mail valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Veuillez entrer une adresse e-mail valide.' });
    }
    
    // Vérification de la longueur minimale du mot de passe
    if (password.length < 4) {
        return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 4 caractères.' });
    }
    // Vérification chiffre et majuscule
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un chiffre et une majuscule.' });
    }
    
    User.findOne({ email })
    .then(user => {
        if(user !== null) {
            res.status(401).json({ message: 'Utilisateur déja enregistré ! Veuillez vous connecter !' });
        } else {
            // hachage du mot de passe 10 fois
            bcrypt.hash(req.body.password, 10)
            .then(hash => {
            // Création de la nouvelle instance de User
            const user = new User({
                email: email,
                password: hash,
            });
            // Sauvegarder du nouvelle user dans la BDD
            user.save()
            .then(() => res.status(201).json({ message: 'utilisateur créé !'}))
            .catch(error => res.status(400).json({ error }))
            })
        }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // Je recherche un user qui correspond à l'email transmis par le client
    User.findOne({ email: req.body.email })
    .then(user => {
        if(user === null) {
            res.status(401).json({ message: 'identifiant et/ou mot de passe incorrect' });
        } else {
            // je compare le mdp transmis par le client à celui enregistré dans la BDD
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                    res.status(401).json({ message: 'identifiant et/ou mot de passe incorrect' });
                } else {
                    res.status(200).json({
                        // je retourne un objet avec les infos utiles à l'auth des requetes
                        userId: user._id,
                        token: jsonWebToken.sign(
                            { userId: user._id },
                            // clé secrète à modifier pour la production : plus longue
                            process.env.CLE_SECRETE,
                            { expiresIn: '24h' }
                        ),
                    });                 
                }
            })
            .catch(error => res.status(500).json({ error }));
        }
    })
    .catch(error => res.status(500).json({ error }))
};