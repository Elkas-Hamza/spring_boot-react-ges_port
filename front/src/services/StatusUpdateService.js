// filepath: c:\Users\elkas\IdeaProjects\stage\front\src\services\StatusUpdateService.js
let intervalId = null;

const startPeriodicUpdates = (callback, interval) => {
  if (intervalId) {
    console.warn("Periodic updates are already running.");
    return;
  }
  console.log("Starting periodic updates...");
  callback(); // Execute immediately once
  intervalId = setInterval(callback, interval);
};

const stopPeriodicUpdates = () => {
  if (intervalId) {
    console.log("Stopping periodic updates...");
    clearInterval(intervalId);
    intervalId = null;
  } else {
    console.log("No periodic updates to stop.");
  }
};

const StatusUpdateService = {
  startPeriodicUpdates,
  stopPeriodicUpdates,
};

export default StatusUpdateService;
