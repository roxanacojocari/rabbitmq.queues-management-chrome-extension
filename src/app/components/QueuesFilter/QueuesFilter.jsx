import React from 'react';
import './QueuesFilter.css';

function QueuesFilter ({
  onFilterChanged,
  checkboxChecked,
  onCheckboxChanged
}) {
  return (
    <div className='horizontal'>
      <span>Filter:{' '}
        <input type='text' onChange={onFilterChanged} />
      </span>
      <span>
        <input type='checkbox' onChange={onCheckboxChanged} checked={checkboxChecked} />
        Regex{' '}
      </span>
    </div>
  );
}
export default QueuesFilter;
