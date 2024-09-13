import { Router } from "express";
import usersManager from "../controllers/users.manager.mdb.js";
import { uploader } from "../services/uploader.js";
import nodemailer from 'nodemailer';
import config from "../config.js";
import {handlePolicies, current } from "../services/utils.js";

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
  });
const router = Router();
const User = new usersManager();

router.put('/:uid',handlePolicies(['admin']), async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await User.getById(uid);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'No se puede cambiar el rol de un administrador' });
        }

        if (!user.documents || user.documents.length === 0) {
            return res.status(400).json({ message: 'El usuario no tiene documentos cargados' });
        }

        const newRole = user.role === 'user' ? 'premium' : 'user';

        const result = await User.update(
            { _id: uid },
            { role: newRole },
            { new: true }
        );

        res.status(200).json({ message: `Rol cambiado a ${newRole}` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al cambiar el rol del usuario', error });
    }
});


router.post('/:uid/documents', uploader.array('documents', 3), async(req,res)=>{
    const { uid } = req.params;
    try {
         if (req.files && req.files.length > 0) {
             const documents = req.files.map(file => ({
                name: file.originalname,
                reference: file.path 
             }))
            const docUser = await User.updateDoc(
                { _id: uid },
                { $push: { documents: { $each: documents } } }, 
                { new: true }
            );
            
            if (docUser) {
                res.status(200).render("uploadSuccess",{id: uid});
            } else {
                res.status(404).render("uploadError");
            }
            
        }else{
            res.status(400).render("uploadError");
        }        
    } catch (error) {
        res.status(500).json({ message: 'Error al subir documentos', error });
    }

});

router.get('/', handlePolicies(['admin']),async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    try {
        const admin = current(req);
      
        if (!req.session.user) return res.redirect("/login");
        const users = await User.getAll();
        const filteredUsers = users.map(user => ({
            _id:user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        }));

        res.render('users', { filteredUsers , admin})
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
});

router.delete('/', async (req, res) => {
    const inactivityTime = 30 * 60 * 1000;
    const now = new Date();

    try {
        const users = await User.getAll();
        console.log(users);

        const inactiveUsers = users.filter(user => {
            const lastConnection = new Date(user.last_connection);
            return now - lastConnection > inactivityTime;
        });
        console.log(inactiveUsers);

        for (const user of inactiveUsers) {
            await User.delete({ _id: user._id });
            const confirmation = await transport.sendMail({
                from: `Sistema Coder <${config.GMAIL_APP_USER}>`,
                to: 'adavalos654@gmail.com',
                subject: 'Tu cuenta ha sido eliminada por inactividad',
                text: 'Lamentamos informarte que tu cuenta ha sido eliminada debido a la inactividad en los últimos días.'
              });
        }

        res.status(200).json({ message: `${inactiveUsers.length} usuarios eliminados por inactividad` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al eliminar usuarios inactivos', error });
    }
});
router.get('/gestion', async(req,res)=>{
    console.log("entre");
    res.status(200).render("admin-user-view");
})
router.delete('/:uid',async (req, res) =>{
    const { uid } = req.params;

    try {
        const result = await User.delete({ _id: uid });
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }

})
export default router;