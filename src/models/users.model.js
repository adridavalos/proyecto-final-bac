import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null);

const collection = 'users_index';
// const collection = 'users_aggregate';

const schema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true, index: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "premium", "user"], default: "user" },
  gender: { type: String, enum: ["Female", "Male","indefinite"], default: "indefinite" },
  documents: [
    {
      name: { type: String, required: true },
      reference: { type: String, required: true } 
    }
  ],
  last_connection: { type: Date }
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;
