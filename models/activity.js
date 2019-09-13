const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const ActivitySchema = mongoose.Schema({
    title: String,
    rating: Number,
    review: Number,
    comment: [],
    images: []
})

ActivitySchema.plugin(mongoosePaginate)

/* global mongodb */
module.exports = mongoose.model('Activity', ActivitySchema)
