// const setupAutoReload = require("./setupAutoReload");
import setupAutoReload from './setupAutoReload';
const tabs = [];

// TODO fix Error handling response: TypeError: chrome.runtime.getPackageDirectoryEntry is not a function
// setupAutoReload();

chrome.tabs.onActivated.addListener(activeInfo => {
  if (tabs.includes(activeInfo.tabId)) {
    chrome.action.enable();
  } else {
    chrome.action.disable();
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request) {
    switch (request.type) {
      case 'initialising-queues-management':
        sendResponse(sender.tab.id);
        break;

      case 'queues-management-initialised':
        tabs.push(sender.tab.id);
        chrome.action.enable(sender.tab.id);
        break;

      default:
        break;
    }
  }

  return true;
});
