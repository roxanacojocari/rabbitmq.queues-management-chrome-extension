// const setupAutoReload = require("./setupAutoReload");
import setupAutoReload from './setupAutoReload';
const tabs = [];

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

      case 'starting-queues-management':
        tabs.push(sender.tab.id);
        chrome.action.enable(sender.tab.id);
        break;

      default:
        break;
    }
  }

  return true;
});
