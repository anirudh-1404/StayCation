const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require('../models/review.js');
const listing = require('../models/listing.js')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');

const reviewController = require('../controllers/reviews.js');

// for review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete review method
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;