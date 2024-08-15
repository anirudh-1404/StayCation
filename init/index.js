const mongoose = require('mongoose')
const initData = require('./data.js')
const listing = require('../models/listing.js')


main().then((res) => {console.log('connection successful')})
.catch((err) => {console.log(err)})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/StayCation')
}

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: '66b6654296beff191e7d0a7e',
    }))
    await listing.insertMany(initData.data);
    console.log('data was initialized')
}

initDB();