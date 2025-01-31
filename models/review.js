const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    rating: {
        type: Number,
        max: 5,
        min: 1,
    },
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

module.exports = mongoose.model('Review', reviewSchema);