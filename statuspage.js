// commands/statusupdate.js
let lastMessageId = ''; // Replace 'YOUR_LAST_MESSAGE_ID' with your actual last message ID

const https = require('https');
const axios = require('axios');
const Config = require('./config.json')

const isApiServerOnline = async (url) => {
    try {
        const response = await axios.get(url);
        return response.status === 200; // Assuming status code 200 indicates the server is running
    } catch (error) {
        return false; // Error occurred, assume server is not online
    }
};

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

const calculateUptime = (startTime) => {
    if (!startTime) return 'N/A'; // Return 'N/A' if start time is not defined
    const currentTime = new Date();
    const uptimeInSeconds = (currentTime - startTime) / 1000;
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

const getLocalTime = () => {
    const currentTimeUTC = new Date();
    const offsetHours = 5; // GMT offset is 5 hours
    const offsetMinutes = 30; // Additional minutes offset
    const totalOffsetMilliseconds = (offsetHours * 60 + offsetMinutes) * 60 * 1000;
    const localTime = new Date(currentTimeUTC.getTime() + totalOffsetMilliseconds);
    return localTime;
};


// Store start times for uptime calculation
let websiteUptimeStartTime;
let apiServerUptimeStartTime;
let testApiServerUptimeStartTime;

// Export a function to start the status update process
module.exports = function(client) {
    // Find the channel where you want to send the status update
    const channelId = Config.channelId;
    const channel = client.channels.cache.get(channelId);

    const websiteURL = Config.websiteURL;
    const apiServerURL = Config.apiServerURL;
    const testApiServerURL = Config.testApiServerURL;

    if (!channel) return console.log('Channel not found.');

    // Define the function to send the status message
    const sendStatusMessage = async () => {

        const currentTimeUTC = new Date();
        const serverTimeFormatted = `${currentTimeUTC.getDate()}/${currentTimeUTC.getMonth() + 1}/${String(currentTimeUTC.getFullYear()).slice(-2)}, ${String(currentTimeUTC.getHours()).padStart(2, '0')}:${String(currentTimeUTC.getMinutes()).padStart(2, '0')}:${String(currentTimeUTC.getSeconds()).padStart(2, '0')} UTC`;
        const localTime = getLocalTime();
        const localTimeFormatted = `${localTime.getDate()}/${localTime.getMonth() + 1}/${String(localTime.getFullYear()).slice(-2)} ${String(localTime.getHours()).padStart(2, '0')}:${String(localTime.getMinutes()).padStart(2, '0')}:${String(localTime.getSeconds()).padStart(2, '0')} GMT+5:30`;


        // Check if the website is online
        const websiteOnline = await isWebsiteOnline(websiteURL);    

        let websiteStatus;
        if (websiteOnline) {
            if (!websiteUptimeStartTime) {
                websiteUptimeStartTime = new Date(); // Start uptime tracking if website just came back up
            }
            websiteStatus = '✅ Website is running';
        } else {
            websiteStatus = '❌ Website is offline';
            // Reset uptime start time if website is down
            websiteUptimeStartTime = null;
        }

        // Calculate website uptime
        const websiteUptime = calculateUptime(websiteUptimeStartTime);

        let apiServerStatus;
        try {
            const apiServerOnline = await isApiServerOnline(apiServerURL);
            if (apiServerOnline) {
                if (!apiServerUptimeStartTime) {
                    apiServerUptimeStartTime = new Date(); // Start uptime tracking if API server just came back up
                }
                apiServerStatus = '✅ API Server is running';
            } else {
                apiServerStatus = '❌ API Server is offline';
                // Reset uptime start time if API server is down
                apiServerUptimeStartTime = null;
            }
        } catch (error) {
            console.error('Error checking API server status:', error);
            apiServerStatus = '❌ API Server status check failed';
        }

        // Calculate API server uptime
        const apiServerUptime = calculateUptime(apiServerUptimeStartTime);

        let testApiServerStatus;
        try {
            const testApiServerOnline = await isApiServerOnline(testApiServerURL);
            if (testApiServerOnline) {
                if (!testApiServerUptimeStartTime) {
                    testApiServerUptimeStartTime = new Date(); // Start uptime tracking if TestAPI server just came back up
                }
                testApiServerStatus = '✅ TestAPI Server is running';
            } else {
                testApiServerStatus = '❌ TestAPI Server is offline';
                // Reset uptime start time if TestAPI server is down
                testApiServerUptimeStartTime = null;
            }
        } catch (error) {
            console.error('Error checking TestAPI server status:', error);
            testApiServerStatus = '❌ TestAPI Server status check failed';
        }

        // Calculate TestAPI server uptime
        const testApiServerUptime = calculateUptime(testApiServerUptimeStartTime);

        // Create the formatted message
        const statusMessage = `
**Anthem's Status Warrior**

**Server Time \`\`${serverTimeFormatted}\`\`**
**Local Time \`\`${localTimeFormatted}\`\`**

**${websiteStatus}** | \`\`${websiteURL}\`\`  | Uptime : \`\`${websiteUptime}\`\`
**${apiServerStatus}** | \`\`${apiServerURL}\`\` | Uptime : \`\`${apiServerUptime}\`\`
**${testApiServerStatus}** | \`\`${testApiServerURL}\`\` | Uptime : \`\`${testApiServerUptime}\`\`

**Server version** - alpha_WayonaaHub_2022datacenter
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
