const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const listing = require('../models/listing.js')
const Review = require('../models/review.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const Listing = require('../models/listing.js');

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(","); // Ensure this line is only executed if error is not null
        throw new ExpressError(400, errMsg);  // It will print error message about that required field
    } else {
        next();
    }
};

// for review
router.post('/', validateReview, wrapAsync(async (req, res, next) => {
    let listings = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listings.reviews.push(newReview);

    await listings.save()
    await newReview.save();

    res.redirect(`/listings/${listings._id}`);
}));

//delete review method
router.delete('/:reviewId', wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    console.log("review deleted")
    res.redirect(`/listings/${id}`);
}))

module.exports = router;