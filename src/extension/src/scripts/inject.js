function sendRootElementInjectedMessage () {
  const message = {
    source: 'queues-management-root-element-injected',
    authHeader: auth_header(),
    timerInterval: window.timer_interval
  };

  window.postMessage(message, '*');
}

(function () {
  // global var used by rabbitmq code
  extension_count++;
  NAVIGATION['Queues management'] = ['#/queues-management', 'management'];
  dispatcher_add(sammy => {
    sammy.get('/queues-management', context => {
      current_highlight = '#/queues-management';
      update_navigation();
      replace_content('main', "<div id='queues-management-root-element'></div>");

      sendRootElementInjectedMessage();
    });
  });
})();
