import startApp from '../../../app/index';

chrome.runtime.sendMessage({ type: 'initialising-queues-management' }, function (response) {
  if (!isRabbitManagement()) return;

  window.addEventListener('message', e => {
    if (e.data.source !== 'queues-management-root-element-injected') return;

    const root = window.document.querySelector('#queues-management-root-element');
    const config = {
      authHeader: e.data.authHeader,
      timerInterval: e.data.timerInterval
    };

    startApp(root, config);
  });

  injectRootElement();

  chrome.runtime.sendMessage({
    type: 'queues-management-initialised'
  });
});

function injectRootElement () {
  const scriptEl = document.createElement('script');
  scriptEl.src = chrome.runtime.getURL('inject.js');
  window.document.head.appendChild(scriptEl);
}

function isRabbitManagement () {
  const title = window.document.head.querySelector('title');
  return title.innerText === 'RabbitMQ Management';
}

function createElement (htmlString) {
  return document.createRange().createContextualFragment(htmlString);
}
