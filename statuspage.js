// commands/statusupdate.js
let lastMessageId = ''; // Replace 'YOUR_LAST_MESSAGE_ID' with your actual last message ID
let uptimeStartTime = new Date(); 

const https = require('https');

const isWebsiteOnline = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve(true); // Website is online
            } else {
                resolve(false); // Website is not online
            }
        }).on('error', (err) => {
            resolve(false); // Error occurred, assume website is not online
        });
    });
};

const calculateUptime = () => {
    const currentTime = new Date();
    const uptimeInSeconds = (currentTime - uptimeStartTime) / 1000;
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

// Export a function to start the status update process
module.exports = function(client) {
    // Find the channel where you want to send the status update
    const channel = client.channels.cache.get('1217529609474543676');

    if (!channel) return console.log('Channel not found.');

    // Define the function to send the status message
    const sendStatusMessage = async () => {
        const currentTime = new Date().toLocaleString();

        const websiteURL = 'https://wayonaaev.in'; // Change this to your website's URL

        // Check if the website is online
        const websiteOnline = await isWebsiteOnline(websiteURL);    

        let websiteStatus;
        if (websiteOnline) {
            websiteStatus = '✅ Website is running';
            if (!uptimeStartTime) {
                uptimeStartTime = new Date(); // Restart uptime tracking if website just came back up
            }
        } else {
            websiteStatus = '❌ Website is offline';
            uptimeStartTime = null; // Reset uptime start time if website is down
        }

        // Calculate uptime
        const uptime = uptimeStartTime ? calculateUptime() : 'N/A';

        // Create the formatted message
        const statusMessage = `
**Anthem's Status Warrior**

**Server Time \`\`${currentTime}\`\`**

**${websiteStatus}** | \`\`${websiteURL}\`\` | Uptime : \`\`${uptime}\`\`
**✅  Api Server is running** | \`\`wayonaaev.in\`\` | Uptime : \`\`20h 10m\`\`
**✅  Test is running** | \`\`wayonaaev.in\`\` | Uptime : \`\`20h 10m\`\`
✅  Server is online | \`\`125.22.173.98\`\`

Server version - alpha_WayonaaHub | refreshed: \`\`10 second ago \`\`
`;

        // If there is a last message ID, update the existing message; otherwise, send a new message
        if (lastMessageId) {
            channel.messages.fetch(lastMessageId)
                .then(msg => {
                    msg.edit(statusMessage)
                        .then(() => console.log('Message updated.'))
                        .catch(console.error);
                })
                .catch(console.error);
        } else {
            channel.send(statusMessage)
                .then(msg => {
                    lastMessageId = msg.id;
                    console.log('Message sent.');
                })
                .catch(console.error);
        }
    };




    // Send the initial status message
    sendStatusMessage();

    // Set interval to update the message every 10 seconds
    setInterval(sendStatusMessage, 2000);
};
