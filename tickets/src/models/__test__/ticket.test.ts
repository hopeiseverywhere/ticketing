import { Ticket } from "../ticket";
it("implements oprimistic concurrency control", async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: "concert",
        price: 5,
        userId: "123",
    });

    // save the ticket to the database
    await ticket.save();

    // fetch the ticket twitce
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make 2 seperate changes to the tickets we fetched
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // save the first fetched ticket
    await firstInstance!.save();

    try {
        // save the second fetched ticket and expect an error due to outdated version property
        await secondInstance!.save();
    } catch (_) {
        return;
    }

    throw new Error("Should not reach to this point");
});

it("Checks if the version of the ticket is incremented on every version", async () => {
    const ticket = Ticket.build({
        title: "A new ticket",
        price: 200,
        userId: "abc",
    });

    for (let x = 0; x < 100; x++) {
        await ticket.save();
        expect(ticket.version).toEqual(x);
    }
});
