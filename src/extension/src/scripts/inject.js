(function () {
  // global var used by rabbitmq code
  extension_count++;
  NAVIGATION['Queues management'] = ['#/queues-management', 'management'];
  dispatcher_add(sammy => {
    sammy.get('/queues-management', context => {
      current_highlight = '#/queues-management';
      update_navigation();
      replace_content('main', "<div id='queues-management-root'></div>");

      const message = {
        source: 'queues-management-extension',
        authHeader: auth_header(),
        timerInterval: window.timer_interval
      };

      window.postMessage(message, '*');
    });
  });
})();
