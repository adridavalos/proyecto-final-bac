import { Router } from "express"; 
import passport from "passport";

import config from "../config.js";
import usersManager from "../controllers/users.manager.mdb.js"
import { verifyRequiredBody, current } from "../services/utils.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import cartManager from "../controllers/cartManager.js"

const router = Router();

const manager = new usersManager();
const cartsManager = new cartManager();

initAuthStrategies();


router.post("/login", verifyRequiredBody(["email", "password"]),passport.authenticate('login', {failureRedirect: `/login?error=${encodeURI("Usuario o clave no válidos")}`}),async (req, res) => {
    try {

      req.session.user = req.user;
      await manager.updateDoc(
        { _id: req.user._id },
        { last_connection: new Date() }, 
        { new: true } 
      );
      req.session.save((err) => {
        if (err) {
          return res.status(500).send({
            origin: config.SERVER,
            payload: null,
            error: err.message,
          });
        }
        
        const { password, ...userWithoutPassword } = req.user;

        res.cookie('currentUser', JSON.stringify({
           user: userWithoutPassword
         }), {
           httpOnly: true,
           maxAge: 24 * 60 * 60 * 1000 
        });

        if (req.user.role === 'admin') {
          res.redirect("/realtimeproducts");
        } else{ 
          res.redirect("/products");
        }
      });
    } catch (err) {
      res.status(500).send({ origin: config.SERVER, payload: null, error: err.message });
    }
  }
);


router.get("/ghlogin",passport.authenticate("ghlogin", { scope: ["user"] }),async (req, res) => {}
);

router.get("/ghlogincallback", passport.authenticate("ghlogin", { failureRedirect: `/login?error=${encodeURI("Error al identificar con Github")}` }), async (req, res) => {  
  try {
    req.session.user = req.user;
    await manager.updateDoc(
      { _id: req.user._id },
      { last_connection: new Date() }, 
      { new: true } 
    );
    req.session.save((err) => {
      if (err) {
        return res
          .status(500)
          .send({ origin: config.SERVER, payload: null, error: err.message });
      }
      const { password, ...userWithoutPassword } = req.user;

      res.cookie('currentUser', JSON.stringify({
         user: userWithoutPassword
       }), {
         httpOnly: true,
         maxAge: 24 * 60 * 60 * 1000 
      });

      if (req.user.role === 'admin') {
        res.redirect("/realtimeproducts");
      } else {
        res.redirect("/products");
      }
    });
  } catch (err) {
    res
      .status(500)
      .send({ origin: config.SERVER, payload: null, error: err.message });
  }
});


// Limpiamos los datos de sesión
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)return res.status(500).send({ origin: config.SERVER, payload: "Error al ejecutar logout", error: err});
      res.redirect('/login');
      
    });
  } catch (err) {
    res
      .status(500)
      .send({ origin: config.SERVER, payload: null, error: err.message });
  }
});


router.post("/register", verifyRequiredBody(['firstName', 'lastName', 'email', 'password']), async (req, res) => {
    try {
      const result = await manager.Aggregated(req.body);

      if (result === "El email ya está registrado.") {
        return res.status(400).send({ message: result });
      }

      await cartsManager.addCart(result._id.toHexString()); 
      req.session.user = result;
      await manager.updateDoc(
        { _id: result._id },
        { last_connection: new Date() }, 
        { new: true } 
      );
      req.session.save((err) => {
        if (err) {
          return res
            .status(500)
            .send({ origin: config.SERVER, payload: null, error: err.message });
        }
        const { password, ...userWithoutPassword } = result;

        res.cookie('currentUser', JSON.stringify({
          user: userWithoutPassword
        }), {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000
        });
        
          if (result.role === 'admin') {
            return res.redirect("/realtimeproducts");
            
          } else {
            return res.redirect("/products");
          }
      });
    } catch (err) {
      res
        .status(500)
        .send({ origin: config.SERVER, payload: null, error: err.message });
    }
 });

router.get("/current", async (req, res) => {
    const user = current(req);
  if (user) {
    return res.status(200).send({ status: "success", payload: user });
  }
  return res.status(401).send({ status: "error", message: "User not authenticated" });
});



export default router;
