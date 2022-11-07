const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
    {
        title: {type: String, required: true, minLength: 1},
        image: { type: String},
        description: {type: String, required: true, minLength: 1},
        price: {type: Number, required: true, minLength: 1},
        quantity: {type: Number, required: true, minLenth: 1},
        timestamp: {type: Date, required: true}
    }
);

ProductSchema.
    virtual('url')
    .get(()=>{
        return this._id;
    });

module.exports = mongoose.model('Product', ProductSchema);