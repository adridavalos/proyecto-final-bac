import { Router } from "express";
import resetPassword from "../controllers/resetPasswordManager.js";
import nodemailer from 'nodemailer';
import config from "../config.js";
import usersManager from "../controllers/users.manager.mdb.js";
import {isValidPassword} from "../services/utils.js"
const managerUser = new usersManager();
const passwordReset = new resetPassword();

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
      user: config.GMAIL_APP_USER,
      pass: config.GMAIL_APP_PASS
  }
});
const router = Router();

router.get("/request-email" ,async(req,res)=>{
    res.render('passwordReset', {});
});
  
router.post("/email", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await managerUser.getOne({ email });
     
      if (user) {
        const user_id = user._id.toString();
        const passwordChange = await passwordReset.add(user_id);
        const confirmation = await transport.sendMail({
          from: `Sistema Coder <${config.GMAIL_APP_USER}>`,
          to: 'adavalos654@gmail.com',
          subject: 'Modificar contraseña',
          html: `
            <h1>Ecommerce</h1>
            <p>Haz clic en el siguiente botón para modificar tu contraseña:</p>
            <a href="http://localhost:${config.PORT}/api/reset-password/${passwordChange._id.toString()}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
              Modificar Contraseña
            </a>`
        });
        res.render('resetEmailSent', {
          message: 'Se ha enviado un correo electrónico para la recuperación de contraseña. Revisa tu bandeja de entrada.'
        });
      } else {
        res.render('resetEmailSent', {
          message: 'No se encontró ningún usuario con ese correo electrónico.'
        });
      }
    } catch (err) {
      res.status(500).send({ status: 'Err', data: err.message });
    }
});
router.get('/:idReset', async(req, res) => {
  const resetToken = await passwordReset.getById({ _id: req.params.idReset });
  if (!resetToken) {
    return res.render('passwordReset', { message: 'Token no encontrado o ha expirado' });
  }
  res.status(200).render('resetPassword',{userId: resetToken.user_Id.toString()});
});
router.post("/:userId",async(req,res)=>{
  try{
    const user = await managerUser.getById({_id:req.params.userId});
    if (!user) {
      return res.status(400)({ message: 'Usuario no encontrado'});
    };
    if (isValidPassword(req.body.password,user.password.toString())) {
      return res.render('passwordResetError');
    };
    const userMod =await managerUser.updatePassword({ _id: req.params.userId }, req.body.password, { new: true });
    if(userMod){
      return res.render('passwordResetSuccess');
    }else{
      return res.render('resetPasswordError');
    }
  }catch (error) {
    console.error('Error al procesar el token de restablecimiento:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }

})

  export default router;