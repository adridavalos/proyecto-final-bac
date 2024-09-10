import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null);

const collection = 'password-change-Try';

const schema = new mongoose.Schema({
    user_Id:{type:mongoose.Schema.Types.ObjectId, required: true},
    expiresAt: {type: Date,required: true}
  
},{
    timestamps:true
});
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;
