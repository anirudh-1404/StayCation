const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const listing = require('../models/listing.js');
const Review = require('../models/review.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(","); // Ensure this line is only executed if error is not null
        throw new ExpressError(400, errMsg);  // It will print error message about that required field
    } else {
        next();
    }
};

//Index
router.get('/', wrapAsync(async (req, res) => {
    let allListings = await listing.find({});
    console.log('all listings have been displayed');
    res.render('listings/index.ejs', { allListings });
}));

//New
router.get('/new', async(req, res) => {
    res.render('listings/new.ejs');
})   //isko show ke upar rakha kyunki pehle hamara app.js new ko id samajh raha tha and usko dhoond rha tha

router.post('/', validateListing, wrapAsync(async (req, res, next) => {

    // let {title, description, image, price, location, country} = req.body;
    // let newList = new listing({
    //     title: title
    //     description: description,
    //     image: image,
    //     price: price,
    //     location: location,
    //     country: country,
    // });


    let newList = new listing(req.body.listing);
    await newList.save();
    console.log(newList);
    // console.log(req.body);
    res.redirect('/listings')

}));

//show route
router.get('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listings = await listing.findById(id).populate("reviews").exec();
    console.log('Listing:', listings); // Log the listing object
    if (!listings) {
        throw new ExpressError(404, "Listing not found!");
    }
    res.render('listings/show.ejs', { listings });
}))

//Edit
router.get('/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listings = await listing.findById(id);
    res.render('listings/edit.ejs', { listings })
}));

router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedList = await listing.findByIdAndUpdate(id, { ...req.body.listing });
    console.log(updatedList);
    res.redirect(`/listings/${id}`)
}));


//Delete
router.delete('/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedList = await listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect('/listings')
}));


module.exports = router;