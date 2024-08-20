const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const path = require('path');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

const listingControllers = require('../controllers/listings.js');


router.route("/")
    .get(wrapAsync(listingControllers.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingControllers.createListing));

// Route to show form for creating a new listing
router.get('/new', isLoggedIn, listingControllers.renderNewForm);

router.route('/:id')
    .get(wrapAsync(listingControllers.showListing))
    .put(isOwner, isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingControllers.updateListing))
    .delete(isOwner, isLoggedIn, wrapAsync(listingControllers.destroyListing));

// Route to show form for editing a listing
router.get('/:id/edit', isOwner, isLoggedIn, wrapAsync(listingControllers.renderEditForm));

module.exports = router;
