import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = "carts";

const schema = new mongoose.Schema({
  _user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users_index"},
  products: {
    type: [{ product: mongoose.Schema.Types.ObjectId, quantity: Number }],
    required: true,
    ref: "products",
  },
});

const model = mongoose.model(collection, schema);

export default model;
