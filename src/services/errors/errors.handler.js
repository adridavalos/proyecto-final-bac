import errorMessages from './enums.js'
import config from '../../config.js';

const errorsHandler =(error,req,res,next)=>{
    let customErr = errorMessages[0];
    for(const key in errorMessages){
        if(errorMessages[key].code === error.type.code) customErr = errorMessages[key];
    }
    return res.status(customErr.status).send({origin: config.SERVER,payload:"", error:customErr})
}

export default errorsHandler;