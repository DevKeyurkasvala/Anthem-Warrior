const { Client, Intents } = require('discord.js');  

const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES
    ]
});


const fs = require('fs');
const { prefix, token } = require('./config.json');


// index.js

// Require the statusupdate function
const statusUpdateFunction = require('./statuspage');


// Assuming you have a Discord client setup in your index.js, pass it to the statusUpdateFunction
// For example:


// Set up your client...

// Once your client is logged in and ready, call the statusUpdateFunction with the client
client.once('ready', () => {
    console.log('Logged in as ' + client.user.tag);
    statusUpdateFunction(client); // Call the status update function and pass the client
});


client.login(token);
