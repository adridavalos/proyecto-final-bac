import resetModel from '../models/passwordChangeTry.model.js';

class RecetManager {
  constructor() {}
  getById = async (id) => {
    try {
      return await resetModel.findById(id).lean();
    } catch (err) {
      return { error: true, message: err.message };
    }
  };
  add = async (userId) => {
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      return await resetModel.create({
        user_Id: userId,
        expiresAt: expiresAt
      });
    } catch (err) {
      return err.message;
    }
  };
}
export default  RecetManager;
