const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const User = require("../models/User");


// Route pour créer un nouvel utilisateur "SIGNUP"
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash 
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé avec succès !'}))
        .catch(error => res.status(400).json({ message: "Email déjà utilisé !", error }))
    })
    .catch(error => res.status(500).json({ error }));
};

// Route pour se connecter "LOGIN"
exports.login = (req, res, next) => {
  User.findOne({email: req.body.email})
  .then(user => {
    if (user === null) {
      res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte'});
    } else {
      bcrypt.compare(req.body.password, user.password)
      .then(valid => {
        if (!valid) {
          res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte'})
        } else {
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
          console.log('Connexion Utilisateur Réussie !')
        }
      })
      .catch(error => {
        res.status(500).json({ error });
      })
    }
  })
  .catch(error => {
    res.status(500).json({ error });
  })
};