const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/book');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');
const { convertToWebp } = require('../middleware/multer');

router.post('/', auth, multer, convertToWebp, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.addRating);
router.put('/:id', auth, multer, convertToWebp, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/bestrating', booksCtrl.getBestBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);




module.exports = router;