import startApp from '../../../app/index';

chrome.extension.sendMessage({ type: 'queues-management-rabbit-load' }, function (response) {
  if (!isRabbitManagement()) return;

  const scriptEl = createElement(`<script>(${bootstrapScript.toString()})();</script>`);
  window.document.head.appendChild(scriptEl);

  chrome.runtime.sendMessage({
    type: 'queues-management-rabbit-start'
  });

  window.addEventListener('message', e => {
    if (e.data.source === 'queues-management') {
      const root = window.document.querySelector('#queues-management-root');

      const config = {
        authHeader: e.data.authHeader,
        timerInterval: e.data.timerInterval
      };
      startApp(root, config);
    }
  });
});

function isRabbitManagement () {
  const title = window.document.head.querySelector('title');
  return title.innerText === 'RabbitMQ Management';
}

function createElement (htmlString) {
  return document.createRange().createContextualFragment(htmlString);
}

function bootstrapScript () {
  // global var used by rabbitmq code
  extension_count++;
  NAVIGATION['Queues management'] = ['#/queues-management', 'management'];
  dispatcher_add(sammy => {
    sammy.get('/queues-management', context => {
      current_highlight = '#/queues-management';
      update_navigation();
      replace_content('main', "<div id='queues-management-root'></div>");

      const message = {
        source: 'queues-management',
        authHeader: auth_header(),
        timerInterval: window.timer_interval
      };

      window.postMessage(message, '*');
    });
  });
}
