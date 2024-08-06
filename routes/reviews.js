const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/review.js');
const { reviewSchema } = require('../schema.js');
const listing = require('../models/listing.js')

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
    console.log(req.body);
    let listings = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listings.reviews.push(newReview);

    await listings.save()
    await newReview.save();
    req.flash('success', 'New Review Created!')

    res.redirect(`/listings/${listings._id}`);
}));

//delete review method
router.delete('/:reviewId', wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    await listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!')

    console.log("review deleted")
    res.redirect(`/listings/${id}`);
}))

module.exports = router;