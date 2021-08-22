import React from 'react';
import { useAsyncDebounce, useTable, useRowSelect, usePagination, useSortBy } from 'react-table';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import QueuesActions from '../QueuesActions/QueuesActions';
import QueuesFilter from '../QueuesFilter/QueuesFilter';
import SortDirectionIndicator from '../SortDirectionIndicator/SortDirectionIndicator';
import TablePagination from '../TablePagination/TablePagination';
import './QueuesTable.css';

function QueuesTable ({
  columns,
  data,
  onDeleteQueues,
  onPurgeQueues,
  fetchData,
  loading,
  totalCount,
  pageCount: controlledPageCount
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 25 }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount,
      manualSortBy: true,
      disableMultiSort: true
    },
    useSortBy,
    usePagination,
    useRowSelect
  );

  const [filter, setFilter] = React.useState('');
  const [useRegex, setUseRegex] = React.useState(false);

  const [preventDeleteWithMessages, setPreventDeleteWithMessages] = React.useState(false);
  const [preventDeleteWithConsumers, setPreventDeleteWithConsumers] = React.useState(false);

  const fetchDataDebounced = useAsyncDebounce(fetchData, 100);

  const changeFilterDebounced = useAsyncDebounce(async (value) => {
    if (filter !== value) {
      setFilter(value);
    }
  }, 1000);

  async function deleteQueues (event) {
    if (!selectedFlatRows.length) {
      return;
    }

    await onDeleteQueues(selectedFlatRows, preventDeleteWithMessages, preventDeleteWithConsumers);
    await fetchData({ pageIndex, pageSize, filter, useRegex, sortBy });
  }

  async function purgeQueues (event) {
    if (!selectedFlatRows.length) {
      return;
    }

    await onPurgeQueues(selectedFlatRows);
    await fetchData({ pageIndex, pageSize, filter, useRegex, sortBy });
  }

  // Listen for changes in pagination and use the state to fetch our new data
  React.useEffect(() => {
    fetchDataDebounced({ pageIndex, pageSize, filter, useRegex, sortBy });
  }, [fetchDataDebounced, pageIndex, pageSize, filter, useRegex, sortBy]);

  return (
    <div className='queuesTable'>
      <h1>Queues management</h1>
      <div className='section section-invisible' />
      <QueuesFilter
        onFilterChanged={e => changeFilterDebounced(e.target.value)}
        checkboxChecked={useRegex}
        onCheckboxChanged={e => setUseRegex(!useRegex)}
      />
      <div className='section section-invisible' />
      <div>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <div>
                      {column.render('Header')}
                      <SortDirectionIndicator isSorted={column.isSorted} isSortedDesc={column.isSortedDesc} />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
            <LoadingIndicator
              loading={loading}
              displayedResults={page.length}
              totalResults={totalCount}
            />
          </tbody>
        </table>
        <TablePagination
          gotoPage={gotoPage}
          canPreviousPage={canPreviousPage}
          previousPage={previousPage}
          nextPage={nextPage}
          canNextPage={canNextPage}
          pageOptions={pageOptions}
          pageCount={pageCount}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageIndex={pageIndex}
        />
      </div>
      <div className='section section-invisible' />
      <QueuesActions
        preventDeleteWithMessagesChecked={preventDeleteWithMessages}
        onPreventDeleteWithMessagesChanged={e => setPreventDeleteWithMessages(!preventDeleteWithMessages)}
        preventDeleteWithConsumersChecked={preventDeleteWithConsumers}
        onPreventDeleteWithConsumersChanged={e => setPreventDeleteWithConsumers(!preventDeleteWithConsumers)}
        deleteQueues={deleteQueues}
        purgeQueues={purgeQueues}
      />
    </div>
  );
}
export default QueuesTable;
