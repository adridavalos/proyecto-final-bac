import fs from 'fs'
class ProductsManager {
    constructor(route) {
        this.products = [];
        this.path = route;
    }

    getAll = async (limit = 10, page = 1, query, sort) => {
        try {
            const productos = await this.recoverProduct();
            return limit === 0 ? productos : productos.slice(0, limit);
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };

    getById = async (id) => {
        try {
            const data = await this.recoverProduct();
            const product = data.find((item) => item.id === id);
        if (product) {
            return product;
        } else {
            console.log("Not found");
            return null;
        }
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }

    };

    add = async (newData) => {
        try {
            this.products = await this.recoverProduct();
            let productExistence = this.products.some(
              (item) => item.code === newData.code
            );
            if (productExistence) {
                throw new Error(`Codigo repetido ${newData.code}`);
            } else {
                const id = this.generateUniqueId();
                this.products.push({ ...newData, id });
                await fs.promises.writeFile(
                this.path,
                JSON.stringify(this.products),
                "utf-8"
                );
                return id;
            }
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };

    update = async (filter, update, options) => {
        try {
            this.products = await this.recoverProduct();
            let encontrado = false;
            for (const product of this.products) {
                if (product._id === filter) {
                for (let key in update) {
                    if (key in product) {
                        product[key] = update[key];
                    } else {
                        product[key] = update[key];
                    }
                }
                encontrado = true;
                break;
                }
            }
            if (!encontrado) {
                throw new Error(`id ${filter} no encontrado`);
            } else {
                await fs.promises.writeFile(
                this.path,
                JSON.stringify(this.products),
                "utf-8"
                );
            }
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };

    delete = async (id) => {
        try {
            this.products = await this.recoverProduct();

        if (await this.getProductById(id)) {
            let productsFiltered = this.products.filter( (product) => product._id !== id );
            await fs.promises.writeFile(
            this.path,
            JSON.stringify(productsFiltered),
            "utf-8"
            );
        } else {
            throw new Error(`id ${id} no encontrado`);
        }
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };


    generateUniqueId() {
        let max = 0;
        if (this.products.length) {
        this.products.forEach((element) => {
            if (max < element.id);
            max = element.id;
        });
        }
        return max + 1;
    }

    async recoverProduct() {
        try {
        let products = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(products);
        } catch (error) {
        console.error("Error:", error);
        throw error;
        }
    }
    
}

export default ProductsManager;

//FILE SYSTEM

// import fs from "fs";

// class ProductManager {
//   constructor(route) {
//     this.products = [];
//     this.path = route;
//   }
//   async addProduct(product) {
//     try {
//       this.products = await this.recoverProduct();
//       let productExistence = this.products.some(
//         (item) => item.code === product.code
//       );
//       if (productExistence) {
//         throw new Error(`Codigo repetido ${product.code}`);
//       } else {
//         const id = this.generateUniqueId();
//         this.products.push({ ...product, id });
//         await fs.promises.writeFile(
//           this.path,
//           JSON.stringify(this.products),
//           "utf-8"
//         );
//         return id;
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }

//   async getProducts(limit) {
//     try {
//       const productos = await this.recoverProduct();
//       return limit === 0 ? productos : productos.slice(0, limit);
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }

//   async getProductById(id) {
//     try {
//       const data = await this.recoverProduct();
//       const product = data.find((item) => item.id === id);
//       if (product) {
//         return product;
//       } else {
//         console.log("Not found");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }

//   async updateProduct(id, campos) {
//     try {
//       this.products = await this.recoverProduct();
//       let encontrado = false;
//       for (const product of this.products) {
//         if (product.id === id) {
//           for (let key in campos) {
//             if (key in product) {
//               product[key] = campos[key];
//             } else {
//               product[key] = campos[key];
//             }
//           }
//           encontrado = true;
//           break;
//         }
//       }
//       if (!encontrado) {
//         throw new Error(`id ${id} no encontrado`);
//       } else {
//         await fs.promises.writeFile(
//           this.path,
//           JSON.stringify(this.products),
//           "utf-8"
//         );
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }
//   async deleteProduct(id) {
//     try {
//       this.products = await this.recoverProduct();

//       if (await this.getProductById(id)) {
//         let productsFiltered = this.products.filter(
//           (product) => product.id !== id
//         );
//         await fs.promises.writeFile(
//           this.path,
//           JSON.stringify(productsFiltered),
//           "utf-8"
//         );
//       } else {
//         throw new Error(`id ${id} no encontrado`);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }

//   generateUniqueId() {
//     let max = 0;
//     if (this.products.length) {
//       this.products.forEach((element) => {
//         if (max < element.id);
//         max = element.id;
//       });
//     }
//     return max + 1;
//   }

//   async recoverProduct() {
//     try {
//       let products = await fs.promises.readFile(this.path, "utf-8");
//       return JSON.parse(products);
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }
// }

// export default ProductManager;
