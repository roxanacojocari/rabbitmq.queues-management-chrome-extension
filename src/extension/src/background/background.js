const tabs = [];

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
        // send a response to trigger next step
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
});
