const activities = [
    { name: 'devanthems Servers', type: 'WATCHING' },
    // { name: 'Listening to music', type: 'LISTENING' }
    // Add more activities as needed
];

// Set an initial activity
let currentActivityIndex = 0;
const updateActivity = (client) => {
    currentActivityIndex = (currentActivityIndex + 1) % activities.length; // Cycle through activities
    client.user.setActivity(activities[currentActivityIndex].name, { type: activities[currentActivityIndex].type });
};

module.exports = { updateActivity };
