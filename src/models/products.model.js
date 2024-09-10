import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';//paginate

mongoose.pluralize(null);

const collection = 'products';

const schema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: false },
    code: { type: String, required: true },
    stock: { type: Number, required: true },
    status: { type: Boolean, default: true },
    category: { type: Number, required: true },
    owner:{type: String, requiered: true},
});
schema.plugin(mongoosePaginate);//paginate
const model = mongoose.model(collection, schema);


export default model;
