// const setupAutoReload = require("./setupAutoReload");
import setupAutoReload from "./setupAutoReload";
const tabs = [];

setupAutoReload();

chrome.tabs.onActivated.addListener(activeInfo => {
  if (tabs.includes(activeInfo.tabId)) {
    chrome.browserAction.enable();
  } else {
    chrome.browserAction.disable();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.type === "queues-management-rabbit-load") {
      sendResponse('RabbitMQ extension enabled!');
  }

  if (request && request.type === "queues-management-rabbit-start") {
    tabs.push(sender.tab.id);
    chrome.browserAction.enable(sender.tab.id);
  }
  return true;
});
