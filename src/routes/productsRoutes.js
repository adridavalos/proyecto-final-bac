import { response, Router } from "express";
import ProductManager from "../controllers/productManager.js";
import config from '../config.js';
import { handlePolicies, current } from "../services/utils.js";
import { uploader } from "../services/uploader.js";
import nodemailer from 'nodemailer';


const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
      user: config.GMAIL_APP_USER,
      pass: config.GMAIL_APP_PASS
  }
});

const router = Router();
const manager = new ProductManager();

router.param("pid", async (req, res, next, pid) => {
  if (!config.MONGODB_ID_REGEX.test(req.params.pid)) {
    return res
      .status(400)
      .send({ origin: config.SERVER, payload: null, error: "Id no válido" });
  }

  next();
});

router.get("/", async (req, res) => {
  const limit = req.query.limit;
  const page = req.query.page;
  const query = req.query.query;
  const sort = req.query.sort;
  const products = await manager.getAll(limit,page,query,sort);
  res.status(200).render("home", { products: products });
});
router.get("/:pid", async (req, res) => {
  const id = req.params.pid;
  const product = await manager.getById(id);
  if (product) {
    res.status(200).send({ status: 1, payload: product.docs});
  } else {
    res.send({ status: 0, payload: "El producto no existe" });
  }
});

router.post("/products", handlePolicies(['admin', 'premium']),uploader.single('thumbnail'), async (req, res) => {
    try {
      const socketServer = req.app.get("socketServer");
      const user = current(req);

      const product = {
        ...req.body,
        owner: user._id,
        thumbnail: req.file ? req.file.path : ''
      };

      const id = await manager.add(product); 

      socketServer.emit("productsChanged", product);

      res.status(200).json({
        origin: "server1",
        message: "Producto agregado exitosamente",
        product: product,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        origin: "server1",
        message: "Error al agregar el producto",
        error: error.message,
      });
    }
  }
);

router.put("/:pid",handlePolicies(['admin','premium' ]),uploader.array('documents', 3), async (req, res) => {
  try {
    const socketServer = req.app.get("socketServer");
    const filter = { _id: req.params.pid };
    const update = req.body;
    const options = { new: true };
    await manager.update(filter,update,options);
    res.status(200).send({
      origin: "server1",
      payload: `Se modifico el producto con id: ${req.params.pid}`,
    });
    socketServer.emit("productsChanged", req.body);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).send({ origin: "server1", payload: error.message });
  }
});

router.delete('/:pid', handlePolicies(['admin', 'premium']), async (req, res) => {
  try {
    const { pid } = req.params;
    const user = current(req);
    const product = await manager.getById(pid); 

    if (!product) {
      return res.status(404).send({
        origin: "server1",
        message: "Producto no encontrado."
      });
    }

    const socketServer = req.app.get('socketServer'); 
    if (user.role === "admin") {
      
      const result = await manager.delete({ _id: pid });

      const confirmation = await transport.sendMail({
        from: `Sistema Coder <${config.GMAIL_APP_USER}>`,
        to: 'adavalos654@gmail.com',
        subject: 'Producto eliminado',
        text: `El producto con ID ${pid} ha sido eliminado del sistema.`
      });

      res.status(200).send({
        status: "ok",
        origin: "server1",
        message: "Producto eliminado exitosamente.",
        
      });

      socketServer.emit('productsChanged', { message: 'Producto eliminado' });

    } else if (user.role === "premium" && user._id === product.owner) {
        const result = await manager.delete({ _id: pid });
        

        const confirmation = await transport.sendMail({
          from: `Sistema Coder <${config.GMAIL_APP_USER}>`,
          to: user.email,
          subject: 'Producto eliminado',
          text: `Tu producto con ID ${pid} ha sido eliminado exitosamente del sistema.`
        });
      
        res.status(200).send({
          status: "ok",
          origin: "server1",
          message: "Producto eliminado exitosamente y correo enviado al propietario."
        });
        socketServer.emit('productsChanged', { message: 'Producto eliminado' });

    } else {
      res.status(403).send({
        origin: "server1",
        message: "No tienes permiso para eliminar este producto."
      });
    }
    
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send({
      origin: "server1",
      message: "Error al eliminar el producto."
    });
  }
});



router.all('*', async(req,res)=>{
  res.status(404).send({origin: config.SERVER, payload:null, error:'No se encuentra la ruta solicitada'});
})

export default router;

//Observacion http://localhost:8080/api/products?query={"category":8} le paso asi la query lo mismo con sort para que funcione el pedido get
//http://localhost:8080/api/products?query={"category":8}&sort={"price":1}