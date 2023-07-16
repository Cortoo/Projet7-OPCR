// package pour gérer les fichiers
const multer = require('multer');
const sharp = require ('sharp');
const fs = require('fs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    // destination de stockage des fichiers
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    // nom du fichier afin qu'il soit unique
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');

const convertToWebp = (req, res, next) => {
    // Je vérifie si une image a été chargé et si un chemin existe
    if (req.file && req.file.path) {
        const originalImagePath = req.file.path;
        // je remplace l'extension par webp
        const outputPath = req.file.path.replace(/\.[^.]+$/, '.webp');
        
        // Utilisation de la biblio sharp pour convertir l'image et la sauvegarder
        sharp(originalImagePath)
            .toFormat('webp')
            .resize({
                width: 800,
                height: 800,
                fit: 'contain'
            })// redimension des images
            .toFile(outputPath)
            .then(() => {
                // Je vérifie si le fichier d'origine existe pour le supprimer
                if (fs.existsSync(originalImagePath)) {
                    fs.unlinkSync(originalImagePath);
                }
                // mise à jour du chemin du fichier
                req.file.path = outputPath.replace('images\\', '');
                next();
            })
            .catch(error => {
                console.error('Error converting to webp:', error);
                next();
            });
    } else {
       
        next();
    }
};

module.exports.convertToWebp = convertToWebp;