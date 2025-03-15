chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.local.get(['birthdate', 'lifespan', 'showReminder'], (data) => {
    if (!data.birthdate) {
      chrome.storage.local.set({
        birthdate: new Date().toISOString().split('T')[0],
        lifespan: 80,
        showReminder: true
      });
    }
  });
});

// Open popup only once when browser starts
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['showReminder'], (data) => {
    if (data.showReminder) {
      chrome.action.openPopup();
    }
  });
});