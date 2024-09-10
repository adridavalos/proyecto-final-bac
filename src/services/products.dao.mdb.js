import productsModel from "../models/products.model.js";

class ProductsManager {
  constructor() {}

    getAll = async (limit = 10, page = 1, query, sort) => {
        try {
            const options = {
                page: page,
                limit: limit,
                lean: true 
            };
            if (sort) {
                options.sort = JSON.parse(sort);
            }

            if (query) {
                const queryParse = JSON.parse(query);
                const productPaginate = await productsModel.paginate(queryParse, options);
                return productPaginate.docs
            } else {
                 const productPaginate=await productsModel.paginate({}, options);
                 return productPaginate.docs;
            }
        } catch (err) {
            return err.message;
        }   
    };

    getById = async (id) => {
        try {
            return await productsModel.findById(id).lean();
        } catch (err) {
            return err.message;
        }
    };

    add = async (newData) => {
        try {
            return await productsModel.create(newData);;
        } catch (err) {
            console.log('error al crear producto', err);
            return err.message;
        }
    };

    update = async (filter, update, options) => {
        try {
            return await productsModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return err.message;
        }
    };

    delete = async (id) => {
        try {
            return productsModel.findOneAndDelete(id);
        } catch (err) {

            return err.message;
        }
    };
}

export default ProductsManager;
