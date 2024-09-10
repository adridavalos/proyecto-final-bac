import usersModel from '../models/users.model.js';
import { isValidPassword } from '../services/utils.js'; 
import {createHash} from '../services/utils.js';

class userDTO {
  constructor(user) {
    this.user = user;
    this.user.firstName = this.user.firstName.toUpperCase();
    this.user.lastName = this.user.lastName.toUpperCase();
  }
}
class UsersManager {
  constructor() {}

  getAll = async (limit = 0) => {
    try {
      return limit === 0
        ? await usersModel.find().lean()
        : await usersModel.find().limit(limit).lean();
    } catch (err) {
      return err.message;
    }
  };

  getById = async (id) => {
    try {
      return await usersModel.findById(id).lean();
    } catch (err) {
      return err.message;
    }
  };
  getOne = async (filter) => {
    try {
      return await usersModel.findOne(filter).lean();
    } catch (err) {
      return err.message;
    }
  };

  Aggregated = async (newUser) => {
    try {
      // Verifica si el email ya existe en la base de datos
      const existingUser = await usersModel.findOne({ email: newUser.email });

      if (existingUser) {
        // Si el email ya existe, devuelve un mensaje de error
        return "El email ya está registrado.";
      }
      const normalizedUser = new userDTO(newUser);
      normalizedUser.user.password = createHash(normalizedUser.user.password);
      // Si el email no existe, crea el nuevo usuario
      const datosUsu = await usersModel.create(normalizedUser.user);
      
      return datosUsu;
    } catch (err) {
      return err.message;
    }
  };
  credentialAreCorrect = async (email, password) => {
    try {
      const user = await usersModel.findOne({ email: email });

      console.log(user);
      if (!user) {
        return  false
      }

      const isMatch = isValidPassword(password, user.password);

      if (isMatch) {
        return user;
      } else {
        return  false ;
      }
    } catch (err) {
      console.error(err);
      return false ;
    }
  };

  

  getPaginated = async (filter, options) => {
    try {
      return await usersModel.paginate(filter, options);
    } catch (err) {
      return err.message;
    }
  };

  add = async (newData) => {
    try {
      return await usersModel.create(newData);
    } catch (err) {
      return err.message;
    }
  };

  update = async (filter, update, options) => {
    return  usersModel.findOneAndUpdate(filter,  { $set: update }, options);
  };
  updateDoc = async (filter, update, options) => {
    return usersModel.findOneAndUpdate(filter, update, options);
  };
  
  updatePassword = async (filter, newPassword, options) => {
    try {
     
      const hashedPassword = createHash(newPassword);
      const update = { $set: { password: hashedPassword } };
      return await usersModel.findOneAndUpdate(filter, update, options);
    } catch (err) {
      return err.message;
    }
  };

  delete = async (filter) => {
    try {
      return await usersModel.findOneAndDelete(filter);
    } catch (err) {
      return err.message;
    }
  };
}

export default UsersManager;
