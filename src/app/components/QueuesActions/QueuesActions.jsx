import React from 'react';
import './QueuesActions.css';

function QueuesActions ({
  preventDeleteWithMessagesChecked,
  onPreventDeleteWithMessagesChanged,
  preventDeleteWithConsumersChecked,
  onPreventDeleteWithConsumersChanged,
  deleteQueues,
  purgeQueues
}) {
  return (
    <div>
      <div className='deleteConditions'>
        <div>
          <strong>
            <span>Delete options{' '}</span>
          </strong>
        </div>
        <span>
          <input type='checkbox' checked={preventDeleteWithMessagesChecked} onChange={onPreventDeleteWithMessagesChanged} />
          do not delete queues containing messages{' '}
        </span>
        <span>
          <input type='checkbox' checked={preventDeleteWithConsumersChecked} onChange={onPreventDeleteWithConsumersChanged} />
          do not delete queues with consumers{' '}
        </span>
      </div>
      <div className='section section-invisible' />
      <div className='queuesButtons'>
        <input type='submit' onClick={deleteQueues} value='Delete selected queues' />
        <input type='submit' onClick={purgeQueues} value='Purge selected queues' />
      </div>
    </div>
  );
}
export default QueuesActions;
