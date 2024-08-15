const listing = require('../models/listing')
const Review = require('../models/review')

module.exports.createReview = async (req, res, next) => {
    console.log(req.body);
    let listings = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listings.reviews.push(newReview);

    await listings.save()
    await newReview.save();
    req.flash('success', 'New Review Created!')

    res.redirect(`/listings/${listings._id}`);
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!')

    console.log("review deleted")
    res.redirect(`/listings/${id}`);
}