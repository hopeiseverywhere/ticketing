// this file is for define the mongoose Ticket model
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// so lower case string and number here is for types
interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// goal of this interface: list out all the different properties that a normal mongodb document has or an instance of a ticket has
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}
//? optitonal property
// so we can write ticket.version

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        // actual schema template
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
        },
    },
    {
        // custom toJSON function to massage the ID property
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

// Tell mongoose to track the version of different documents using the filed version instead of the default "__v"
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// the only way that we create new records just to make sure that
// we can have TypeScript helping us figure out the different types of attributes we're supposed to be providing.
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

// create actual Ticket model
// <TicketDoc, TicketModel> -> take a TicketDoc type return
// type TicketModel doc
const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

// export the model
export { Ticket };
