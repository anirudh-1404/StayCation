const Listing = require('../models/listing')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken }); //service has been started of geocoding

module.exports.index = async (req, res) => {
    const { country } = req.query;
    const reg = new RegExp(country, 'i') 
    const allListings = await Listing.find({
            country: reg
    });
    // let countryListing = country
    //     ? allListings?.filter(
    //         (listing) => listing.country.toLowerCase() === country.toLowerCase()
    //     )
    //     : allListings;
    // res.render('listings/searchedResults.ejs', {countryListing});
    // console.log(countryListing);

    if (country && allListings.length == 0) {
        req.flash("error", "not available");
        return res.redirect("/listings");
    }
    req.flash("success", "Available listings!")
    res.render("listings/index.ejs", { allListings: allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: 'author' } }).populate("owner").exec();
    if (!listing) {
        // throw new ExpressError(404, "Listing not found!");
        req.flash('error', 'Listing you requested for does not exist.')
        res.redirect('/listings')
    }
    console.log('Listing details:', listing);
    res.render('listings/show.ejs', { listing });
}

module.exports.createListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send()

    let url = req.file.path;
    let filename = req.file.filename;
    let newList = new Listing(req.body.listing);

    newList.owner = req.user._id;
    newList.image = { url, filename };

    newList.geometry = response.body.features[0].geometry;

    let savedListing = await newList.save();
    console.log(savedListing);
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
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250');
    res.render('listings/edit.ejs', { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let updatedList = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    //cloudinary part
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedList.image = { url, filename };
        await updatedList.save();
    }
    //
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