/*
* The aim of this script is to pull all ticket openers for a given gmodstore product
* So that it can be used on Machine Learning to build a classification model.
* It is intended to be used with liner.ai, but the output data can be adapted or imported to pretty much any data set.
*/

require('dotenv').config()
const env = process.env;
const axios = require('axios');
const fs = require('fs');

const allTickets = [];

// Get a GmodStore's Product's Tickets
async function getGmodstoreProductTickets(productID, cursor) {
    return (await axios.get('https://www.gmodstore.com/api/v3/products/' + productID + '/tickets', {
        headers: {
            Authorization: 'Bearer ' + env.GMS_TOKEN
        },
        params: {
            cursor
        }
    }))?.data
}
// Get the opener message for a given ticket
async function getGmodstoreTicketFirstOpener(ticketID) {
    return (await axios.get('https://www.gmodstore.com/api/v3/tickets/' + ticketID + '/messages', {
        headers: {
            Authorization: 'Bearer ' + env.GMS_TOKEN
        },
        params: {
            perPage: 1
        }
    }))?.data
}
// Get the labels for a given ticket.
async function getGmodstoreTicketTags(ticketID) {
    return (await axios.get('https://www.gmodstore.com/api/v3/tickets/' + ticketID + '/tags', {
        headers: {
            Authorization: 'Bearer ' + env.GMS_TOKEN
        },
        params: {
            perPage: 1
        }
    }))?.data
}

// Used to prevent API rate limiting
async function sleep() {
    await new Promise(r => setTimeout(r, 1000));
}

// The main process loop
async function main() {
    // Set up files
    await fs.rmSync('data', { recursive: true, force: true });
    await fs.mkdirSync('data');
    await fs.mkdirSync('data/unlabelled'); // Used for tickets without tags

    // Build a recursive list of all tickets for the given addon.
    let curCursor = true;
    while (curCursor) {
        console.log('Processing with cursor', curCursor)
        let ticketSet = await getGmodstoreProductTickets(env.GMS_ADDON_ID, curCursor)

        // Add them to the list
        ticketSet.data.forEach(ticket => {
            allTickets.push(ticket.id);
        });

        // Set the next cursor.
        curCursor = ticketSet.cursors.next;

        await sleep();
    }

    console.log('Now processing', allTickets.length, 'tickets');

    let count = 0;
    for (const ticket of allTickets) {
        count++; // So we can do pretty counting in the console for progress.

        console.log('Processing ticket', ticket, '('+ count + '/' + allTickets.length + ')')

        let ticketTags = await getGmodstoreTicketTags(ticket);

        // Pull the ticket from gmodstore's API
        let ticketReply = await getGmodstoreTicketFirstOpener(ticket);

        const messageData = JSON.parse(ticketReply.data[0].body)

        // Because the ticket is given as Delta, we need to essentially brute merge the message together. It's not perfect, but it works (mostly)
        let message = ''
        messageData.ops.forEach(data => {
            message = message + data.insert;
        });

        // Write the file to its given labels
        if (ticketTags?.data?.length > 0) {
            for (const tag of ticketTags.data) {
                // Make the label if it doesn't already exist
                if (!fs.existsSync(tag.name)){
                    await fs.mkdirSync('data/' + tag.name);
                }

                // Save the file
                fs.writeFile('data/' + tag.name + '/' + ticket + '.txt', message, err => {
                    if (err) console.error(err);
                });
            }
        } else {
            // No label, put it in the unlabeled section
            fs.writeFile('data/unlabelled/' + ticket + '.txt', message, err => {
                if (err) console.error(err);
            });
        }

        await sleep();
    }

}

// Top level await is goated, sue me.
(async () => {
    await main();
})();