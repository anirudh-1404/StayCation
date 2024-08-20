if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

var bodyParser = require('body-parser')

console.log(process.env.SECRET);

const express = require('express')
const app = express();
const mongoose = require('mongoose')
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const listing = require('./models/listing.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require('passport');
const LocalSrategy = require('passport-local');
const User = require('./models/user.js');

const dbUrl = process.env.ATLASDB_URL;
// USE THESE BEFORE YOUR ROUTES TO ADD REVIEWS, AND METHODOVERRIDE - TO ENSURE THAT BODY IS PROPERLY PARSED AND AVAILABLE TO ROUTE HANDLERS.
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))

app.set('view engine', "ejs")
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*3600,
});

store.on('error', () => {
    console.log('session store error');
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalSrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user; 
    next();
})


const listingsRouter = require('./routes/listings.js');
const reviewRouter = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');
const { env } = require('process');
const Listing = require('./models/listing.js');


main().then((res) => { console.log('connection successful') })
    .catch((err) => { console.log(err) })

async function main() {
    await mongoose.connect(dbUrl);
}


app.get('/test', async (req, res) => {
    const data = await Listing.find()
    res.json({data})
})

app.use('/listings', listingsRouter)
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

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