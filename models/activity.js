const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const ActivitySchema = mongoose.Schema({
    name: String,
    thumbnail: String,
    rating: Number,
    review: Number,
    ranking: String,
    address: String,
    comment: [],
    images: [],
    type: Number
})

ActivitySchema.plugin(mongoosePaginate)

/* global mongodb */
module.exports = mongoose.model('Activity', ActivitySchema)
