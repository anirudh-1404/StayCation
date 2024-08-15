const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const path = require('path');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const listingControllers = require('../controllers/listings.js');


router.route("/")
    .get(wrapAsync(listingControllers.index))
    // .post(isLoggedIn, validateListing, wrapAsync(listingControllers.createListing));
    .post(upload.single('listing[image]') ,(req, res) => {
        res.send(req.file)
    })


// Route to show form for creating a new listing
router.get('/new', isLoggedIn, listingControllers.renderNewForm);  //isko show ke upar rakha kyunki pehle hamara app.js new ko id samajh raha tha and usko dhoond rha tha


router.route('/:id')
    .get(wrapAsync(listingControllers.showListing))
    .put(isOwner, isLoggedIn, validateListing, wrapAsync(listingControllers.updateListing))
    .delete(isOwner, isLoggedIn, wrapAsync(listingControllers.destroyListing));


// Route to show a specific listing


// Route to show form for editing a listing
router.get('/:id/edit', isOwner, isLoggedIn, wrapAsync(listingControllers.renderEditForm));


// Route to handle update of a listing

module.exports = router;