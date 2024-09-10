import { Router } from "express";
import cartManager from "../controllers/cartManager.js";
import config from "../config.js"
import { handlePolicies, current } from "../services/utils.js";
import proManager from "../controllers/productManager.js";

const router = Router();
const manager = new cartManager();
const productManager = new proManager();

router.param("pid", async (req, res, next, pid) => {
  if (!config.MONGODB_ID_REGEX.test(req.params.pid)) {
    return res
      .status(400)
      .send({ origin: config.SERVER, payload: null, error: "Id no válido" });
  }

  next();
});
router.param("cid", async (req, res, next, cid) => {
  if (!config.MONGODB_ID_REGEX.test(req.params.cid)) {
    return res
      .status(400)
      .send({ origin: config.SERVER, payload: null, error: "Id no válido" });
  }

  next();
});

// La ruta raíz POST / deberá crear un nuevo carrito con la siguiente estructura:
// Id:Number/String (A tu elección, de igual manera como con los productos, debes asegurar que nunca se dupliquen los ids y que este se autogenere).
// products: Array que contendrá objetos que representen cada producto
router.post("/", async (req, res) => {
  try {
    const id = await manager.addCart();
    res.status(200).send({
      origin: "server1",
      payload: "Se creo carrito con exito",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ origin: "server1", payload: error.message });
  }
});

// La ruta GET /:cid deberá listar los productos que pertenezcan al carrito con el 
//parámetro cid proporcionados.



router.get("/:cid", async (req, res) => {
  try {
    const cart = await manager.getCartById(req.params.cid);
    const mappedProducts = cart.products.map((product) => ({
      _id: product.product._id.toString(),
      title: product.product.title,
      description: product.product.description,
      price: product.product.price,
      stock: product.product.stock,
      quantity:product.quantity,
    }));
    res.status(200).render("carts", { products: mappedProducts,idCart: req.params.cid, user: current(req)});
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ origin: "server1", payload: error.message });
  }
});

// La ruta POST  /:cid/product/:pid deberá agregar el producto al arreglo “products” del carrito seleccionado, 
// agregándose como un objeto bajo el siguiente formato:
// product: SÓLO DEBE CONTENER EL ID DEL PRODUCTO (Es crucial que no agregues el producto completo)
// quantity: debe contener el número de ejemplares de dicho producto. El producto, de momento, se agregará
// de uno en uno.

// Además, si un producto ya existente intenta agregarse al producto, incrementar el campo quantity de dicho 
// producto.


router.post("/:cid/product/:pid", handlePolicies(['user', 'premium']), async (req, res) => {
  try {
    const idCart = req.params.cid;
    const idProduct = req.params.pid;
    const { quantity } = req.body;
    const user = current(req);

    const product = await productManager.getById(idProduct);

    if (!product) {
      return res.status(404).send({
        origin: "server1",
        message: "Producto no encontrado.",
      });
    }
    if (user.role === "premium" && user._id === product.owner) {
      return res.status(403).send({
        origin: "server1",
        message: "No puedes agregar tu propio producto al carrito.",
      });
    }

    await manager.addToCartId(idCart, idProduct, quantity);

    res.status(200).send({
      origin: "server1",
      payload: idCart,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({
      origin: "server1",
      payload: error.message,
    });
  }
});

//debe eliminar del carrito el producto seleccionado
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const idCart = req.params.cid;
    const idProduct = req.params.pid;
    await manager.deleteProductSelection(idCart, idProduct);
    res.status(200).send({
      origin: "server1",
      payload: idProduct,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ origin: "server1", payload: error.message });
  }
  
});
router.delete("/:cid", async (req, res) => {
  try {
    const idCart = req.params.cid;

    await manager.vaciarCarrito(idCart);

     res.status(200).send({
       origin: "server1",
       payload: "Carrito vacio",
     });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ origin: "server1", payload: error.message });
  }
});

router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const idCart = req.params.cid;
    const idProduct = req.params.pid;
    const { quantity } = req.body;
    await manager.actualizarCantidadProductos(idCart, idProduct, quantity);
    res.status(200).send({
      origin: "server1",
      payload: idCart,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ origin: "server1", payload: error.message });
  }

});

router.post("/:cid/purchase", async (req, res) => {
  try{
    const idCart = req.params.cid;
    const {success, message, productsToKeep} = await manager.finalizePurchase(idCart);
    console.log(success,message,productsToKeep);
    if (success){
      res.status(200).send({
        origin: "server1",
        payload: idCart,
        message,
        productsToKeep,
        success
      });  
    }else {
      res.status(400).send({message: 'No se pudo comprar',success});
    }
  }catch (error) {
    console.error("Error:", error);
    res.status(500).send({ origin: "server1", payload: error.message });
  }
});

router.all('*', async(req,res)=>{
  res.status(404).send({origin: config.SERVER, payload:null, error:'No se encuentra la ruta solicitada'});
});
export default router;

