import mongoose from "mongoose";
import cartsModel from "../models/carts.model.js";
import productModel from "../models/products.model.js";
import ticketManager from "./ticketManager.js";

class cartManager {
  constructor() {}
  async addCart(userId) {
    try {
      await cartsModel.create({ _user_id: userId, products: [] });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getCartById(id) {
    try {
      const cart = await cartsModel
        .findById(id)
        .populate({ path: "products.product", model: productModel })
        .lean();
      if (cart) {
        return cart;
      } else {
        throw new Error("carrito no encontrado");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  async getCartByUsuId(uid) {
    try {
      const cart = await cartsModel.findOne({ _user_id: uid }).lean();
      return cart;
    } catch (error) {
      console.error('Error al obtener el carrito por ID de usuario:', error);
      throw error;
    }
  }
    
  async addToCartId(cid, pid, quantity) {
    try {
      // Obtener el carrito por su ID
      const cart = await this.getCartById(cid);
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      const productIndex = cart.products.findIndex(
        (product) => product.product._id.toString() === pid
      );

      if (productIndex !== -1) {
        // Si el producto ya existe en el carrito, incrementar la cantidad
        cart.products[productIndex].quantity += quantity;
      } else {
        // Si el producto no existe en el carrito, agregarlo
        cart.products.push({ product: pid, quantity: quantity });
      }
      // Guardar los cambios en el carrito
      await cartsModel.updateOne({ _id: cid }, { products: cart.products });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async deleteProductSelection(cid, pid) {
    try {
      const cart = await cartsModel.findById(cid);
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      const productObjectId = new mongoose.Types.ObjectId(pid);
      const productIndex = cart.products.findIndex((product) =>
        product.product.equals(productObjectId)
      );

      if (productIndex !== -1) {
        const result = await cartsModel.updateOne(
          { _id: cid },
          { $pull: { products: { product: productObjectId } } }
        );

        if (result.nModified === 0) {
          throw new Error(
            "El producto no está en el carrito o el carrito no existe"
          );
        }
        console.log("Producto eliminado del carrito:", result);
        return result;
      } else {
        throw new Error("El producto no está en el carrito");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async vaciarCarrito(cid) {
    try {
      const result = await cartsModel.updateOne(
        { _id: cid },
        { $set: { products: [] } }
      );

      if (result.nModified === 0) {
        throw new Error("El carrito no existe o ya está vacío");
      }

      console.log("Carrito vaciado:", result);
      return result;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  async actualizarCantidadProductos(cid, pid, quantity) {
    try {
      const productObjectId = new mongoose.Types.ObjectId(pid);

      const result = await cartsModel.updateOne(
        { _id: cid, "products.product": productObjectId },
        { $set: { "products.$.quantity": quantity } }
      );

      if (result.nModified === 0) {
        throw new Error(
          "El producto no está en el carrito o el carrito no existe"
        );
      }

      console.log("Cantidad del producto actualizada:", result);
      return result;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async finalizePurchase(cid) {
    try {
        const cart = await this.getCartById(cid);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        // Listas para productos a actualizar y a mantener en el carrito
        const productsToUpdate = [];
        const productsToKeep = [];
        let totalAmount = 0;

        // Verificar stock de todos los productos
        for (let item of cart.products) {
            if (item.product.stock >= item.quantity) {
                productsToUpdate.push(item);
                totalAmount += item.product.price * item.quantity;
            } else {
                productsToKeep.push(item);
                console.warn(`No hay suficiente stock para el producto: ${item.product.title }`);
            }
        }

        // Si no hay productos disponibles, retornar un mensaje adecuado
        if (productsToUpdate.length === 0) {
            return { success: false, message: 'No hay productos disponibles para procesar la compra.' };
        }

        // Actualizar stock de los productos que tienen suficiente stock
        for (let item of productsToUpdate) {
            const _id = item.product._id.toString();
            item.product.stock -= item.quantity;

            const updateResult = await productModel.findOneAndUpdate(
                { _id },
                { $set: { stock: item.product.stock } },
                { new: true }
            );

            // Verificar que la actualización fue exitosa
            if (!updateResult) {
                throw new Error(`Error al actualizar el stock para el producto: ${item.product.name || 'Producto desconocido'}`);
            }

            // Eliminar producto comprado del carrito
            await this.deleteProductSelection(cid, _id);
        }

        // Mantener productos que no se pudieron comprar en el carrito
        if (productsToKeep.length > 0) {
            await cartsModel.findByIdAndUpdate(cid, { products: productsToKeep });
        }

        // Crear el ticket con los detalles de la compra
        const ticketData = {
            code: `TICKET-${Date.now()}`,
            price: totalAmount,
            purchaser_id: cart._user_id // Asegúrate de que cart tenga el userId
        };

        const ticket = await ticketManager.createTicket(ticketData);

        return { 
            success: true, 
            message: 'Compra finalizada con éxito', 
            ticket,
            productsToKeep
        };
      
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}



}

export default cartManager;
