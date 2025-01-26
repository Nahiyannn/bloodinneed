// This is a background worker to keep the application alive
setInterval(() => {
    console.log('Worker keeping the application alive');
}, 45000); // Ping every 45 seconds to prevent timeout
