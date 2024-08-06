const express = require('express')
const app = express();
const mongoose = require('mongoose')
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const listing = require('./models/listing.js');
const session = require('express-session');
const flash = require("connect-flash");

// USE THESE BEFORE YOUR ROUTES TO ADD REVIEWS, AND METHODOVERRIDE - TO ENSURE THAT BODY IS PROPERLY PARSED AND AVAILABLE TO ROUTE HANDLERS.
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))

app.set('view engine', "ejs")
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate); 
app.use(express.static(path.join(__dirname, "/public")))

const sessionOptions = {
    secret: 'secretcode',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

const listings = require('./routes/listings.js');
const reviews = require('./routes/reviews.js');

app.use('/listings', listings)
app.use('/listings/:id/reviews', reviews);

main().then((res) => { console.log('connection successful') })
    .catch((err) => { console.log(err) })

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/StayCation')
}

// app.get('/', (req, res) => {
//     res.send('Hi, I am root')
// })


// if request goes to any other path except of all these
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "PAGE NOT FOUND!"))
    console.log('PAGE NOT FOUND!');
})

//error middlware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err
    res.status(statusCode).render('error.ejs', { err });
})


app.listen(8080, () => {
    console.log(`app is listening to port 8080`);
});