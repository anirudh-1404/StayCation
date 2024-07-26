const express = require('express')
const app = express();
const mongoose = require('mongoose')
const listing = require('./models/listing.js')
const Review = require('./models/review.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const Listing = require('./models/listing.js');


app.set('view engine', "ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/public")))

main().then((res) => { console.log('connection successful') })
    .catch((err) => { console.log(err) })

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/StayCation')
}


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(","); // Ensure this line is only executed if error is not null
        throw new ExpressError(400, errMsg);  // It will print error message about that required field
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(","); // Ensure this line is only executed if error is not null
        throw new ExpressError(400, errMsg);  // It will print error message about that required field
    } else {
        next();
    }
};


app.get('/', (req, res) => {
    res.send('Hi, I am root')
})

app.get('/listings', wrapAsync(async (req, res) => {
    let allListings = await listing.find({});
    console.log('all listings have been displayed');
    res.render('listings/index.ejs', { allListings });
}));

app.get('/listings/new', (req, res) => {
    res.render('listings/new.ejs');
})   //isko show ke upar rakha kyunki pehle hamara app.js new ko id samajh raha tha and usko dhoond rha tha

app.post('/listings', validateListing, wrapAsync(async (req, res, next) => {

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

// for review
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res, next) => {
    let listings = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listings.reviews.push(newReview);

    await listings.save()
    await newReview.save();

    res.redirect(`/listings/${listings._id}`);
}));

//delete review method
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    console.log("review deleted")
    res.redirect(`/listings/${id}`);
}))

app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listings = await listing.findById(id);
    res.render('listings/edit.ejs', { listings })
}));

app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedList = await listing.findByIdAndUpdate(id, { ...req.body.listing });
    console.log(updatedList);
    res.redirect(`/listings/${id}`)
}));

app.delete('/listings/:id', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedList = await listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect('/listings')
}));



//show route
app.get('/listings/:id/', wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listings = await listing.findById(id).populate("reviews").exec();
    console.log(req.body.listing)
    res.render('listings/show.ejs', { listings })
}));

//if request goes to any other path except of all these
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "PAGE NOT FOUND!"))
})

//error middlware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err
    res.status(statusCode).render('error.ejs', { err });
})


app.listen(8080, () => {
    console.log(`app is listening to port 8080`);
});