import ProductsService from '../services/products.dao.mdb.js'
const service = new ProductsService();
/*  import config from '../config.js'
import ProductsService from '../services/products.dao.fs.js'
const service = new ProductsService(`${config.DIRNAME}/services/products.json`);  */


class ProductDTO {
  constructor(product) {
    this.product = product;
    this.product.title = this.product.title.toUpperCase();
  }
}
class ProductsManager {
  constructor() {}

  getAll = async (limit = 10,page = 1,query, sort) => {
    try {
      return await service.getAll(limit,page,query,sort);
    } catch (err) {
      return err.message;
    }
  };

  getById = async (id) => {
      try {
        return await service.getById(id);
      } catch (err) {
        return err.message;
      }
  };

  add = async (newData) => {
    try {
      const normalizedData = new ProductDTO(newData);
      return await service.add(normalizedData.product);
    } catch (err) {
      return err.message;
    }
  };

  update = async (filter, update, options) => {
    try {
      const normalizedData = new ProductDTO(update);
      return await service.update(filter, normalizedData.product, options);
    } catch (err) {
      return err.message;
    }
  };

  delete = async (id) => {
    try {
      return await service.delete(id);
    } catch (err) {
      return err.message;
    }
  };
}

export default ProductsManager;

