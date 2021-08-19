import React from 'react';

function SortDirectionIndicator ({
  isSorted,
  isSortedDesc
}) {
  return (
    <div>
      <span>{isSorted ? (isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
    </div>
  );
}
export default SortDirectionIndicator;
