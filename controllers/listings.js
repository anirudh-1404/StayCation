const Listing = require('../models/listing')

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    console.log('All listings have been displayed');
    res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: 'author'}}).populate("owner").exec();
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash('error', 'Listing you requested for does not exist.')
        res.redirect('/listings')
    }
    console.log('Listing details:', listing);
    res.render('listings/show.ejs', { listing });
}

module.exports.createListing = async (req, res) => {
    let newList = new Listing(req.body.listing);
    newList.owner = req.user._id;
    await newList.save();
    req.flash('success', 'New listing Created!')
    console.log('New listing created:', newList);
    res.redirect('/listings');
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash('error', 'Listing you requested for does not exist.')
        res.redirect('/listings')
    }
    res.render('listings/edit.ejs', { listing });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    let updatedList = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    req.flash('success', 'Listing Updated!')
    if (!updatedList) {
        throw new ExpressError(404, "Listing not found!");
    }
    console.log('Updated listing:', updatedList);
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedList = await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted!')
    if (!deletedList) {
        throw new ExpressError(404, "Listing not found!");
    }
    console.log('Listing deleted:', deletedList);
    res.redirect('/listings');
}