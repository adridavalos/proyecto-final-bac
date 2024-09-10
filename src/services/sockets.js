import { Server } from "socket.io";

const initSoket = (httpServer)=>{
    const io = new Server(httpServer);

    io.on("connection", (client) => {
      console.log(
        `Cliente conectado, id ${client.id} desde ${client.handshake.address}`
      );
    });

    return io;
}

export default initSoket;