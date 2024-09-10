import { Router } from "express";
import usersManager from "../controllers/users.manager.mdb.js";
import { uploader } from "../services/uploader.js";
const router = Router();
const User = new usersManager();

router.put('/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        
        const user = await User.getById(uid);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.documents.length === 0) {
            return res.status(404).render("uploadError");
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
export default router;