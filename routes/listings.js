const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const {isLoggedIn} = require("../middleware.js");

// Middleware to validate listing data
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Route to display all listings
router.get('/', wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    console.log('All listings have been displayed');
    res.render('listings/index.ejs', { allListings });
}));

// Route to show form for creating a new listing
router.get('/new', isLoggedIn, (req, res) => {
    res.render('listings/new.ejs');
});  //isko show ke upar rakha kyunki pehle hamara app.js new ko id samajh raha tha and usko dhoond rha tha

// Route to handle creation of a new listing
router.post('/', validateListing, wrapAsync(async (req, res) => {
    let newList = new Listing(req.body.listing);
    await newList.save();
    req.flash('success', 'New listing Created!')
    console.log('New listing created:', newList);
    res.redirect('/listings');
}));

// Route to show a specific listing
router.get('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews").exec();
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash('error', 'Listing you requested for does not exist.')
        res.redirect('/listings')
    }
    console.log('Listing details:', listing);
    res.render('listings/show.ejs', { listing });
}));

// Route to show form for editing a listing
router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash('error', 'Listing you requested for does not exist.')
        res.redirect('/listings')
    }
    res.render('listings/edit.ejs', { listing });
}));


// Route to handle update of a listing
router.put('/:id', isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedList = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    req.flash('success', 'Listing Updated!')
    if (!updatedList) {
        throw new ExpressError(404, "Listing not found!");
    }
    console.log('Updated listing:', updatedList);
    res.redirect(`/listings/${id}`);
}));


// Route to handle deletion of a listing
router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted!')
    if (!deletedList) {
        throw new ExpressError(404, "Listing not found!");
    }
    console.log('Listing deleted:', deletedList);
    res.redirect('/listings');
}));

module.exports = router;