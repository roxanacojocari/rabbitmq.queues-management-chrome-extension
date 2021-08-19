import React from 'react';

function LoadingIndicator ({
  loading,
  displayedResults,
  totalResults
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan='10000'>Loading...</td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan='10000'>Showing {displayedResults} of {totalResults}{' '}results</td>
    </tr>
  );
}
export default LoadingIndicator;
