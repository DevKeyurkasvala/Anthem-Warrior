const mysql = require('mysql');
const fs = require('fs');

// MySQL database configuration
const dbConfig = {
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
};

// Discord bot configuration
const channelId = 'YOUR_DISCORD_CHANNEL_ID'; // Replace with your Discord channel ID

// Function to connect to MySQL database and dump data
const dumpDatabase = () => {
    const connection = mysql.createConnection(dbConfig);

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            return;
        }

        console.log('Connected to MySQL database.');

        // Execute SQL query to retrieve data
        connection.query('SELECT * FROM your_table', (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                connection.end();
                return;
            }

            // Save dumped data to a file
            fs.writeFileSync('database_dump.txt', JSON.stringify(results));

            // Send dumped data to Discord channel
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                channel.send({ files: ['database_dump.txt'] })
                    .then(() => console.log('Database dump sent to Discord channel.'))
                    .catch(console.error);
            } else {
                console.error('Channel not found.');
            }

            connection.end();
        });
    });
};

// Schedule database dump to run every 12 hours
// Adjust the cron expression as needed
require('node-cron').schedule('0 */12 * * *', () => {
    dumpDatabase();
});


