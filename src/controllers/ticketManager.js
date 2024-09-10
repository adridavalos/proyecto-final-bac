import Ticket from '../models/ticket.model.js';

class TicketService {
    constructor(){}
    async createTicket(data) {
        const ticket = new Ticket(data);
        return await ticket.save();
    }
}

export default new TicketService();
