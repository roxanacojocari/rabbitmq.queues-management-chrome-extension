import React from 'react'
import { useAsyncDebounce, useTable, useRowSelect, usePagination, useSortBy } from 'react-table'
import "./QueuesTable.css";
import _ from 'lodash';

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <div>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </div>
        )
    }
)

function QueuesTable({
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
        state: { selectedRowIds, pageIndex, pageSize, sortBy },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0 }, // Pass our hoisted table state
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
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    canSort: false,
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ])
        }
    )

    const [filter, setFilter] = React.useState('');
    const [useRegex, setUseRegex] = React.useState(false);

    const [preventDeleteWithMessages, setPreventDeleteWithMessages] = React.useState(false);
    const [preventDeleteWithConsumers, setPreventDeleteWithConsumers] = React.useState(false);

    const fetchDataDebounced = useAsyncDebounce(fetchData, 100)

    const changeFilterDebounced = useAsyncDebounce(async (value) => {
        if (filter !== value) {
            setFilter(value);
        }
    }, 1000);

    // Listen for changes in pagination and use the state to fetch our new data
    React.useEffect(() => {
        fetchDataDebounced({ pageIndex, pageSize, filter, useRegex, sortBy })
    }, [fetchDataDebounced, pageIndex, pageSize, filter, useRegex, sortBy]);

    // Render the UI for your table
    return (
        <div className="queuesTable">
            <h1>Queues management</h1>
            <div className="section section-invisible"></div>
            <div>
                <span>Filter:{' '}
                    <input
                        type="text"
                        onChange={(e) => {
                            changeFilterDebounced(e.target.value)
                        }} />
                </span>
                <span>
                    <input
                        type="checkbox"
                        checked={useRegex}
                        onChange={e => {
                            setUseRegex(!useRegex);
                        }}
                    />
                    Regex{' '}
                </span>
            </div>
            <div className="section section-invisible"></div>
            <div>
                <table {...getTableProps()} >
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                        <div >
                                            {column.render('Header')}
                                            {/* Add a sort direction indicator */}
                                            <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? ' 🔽'
                                                        : ' 🔼'
                                                    : ''}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row, i) => {
                            prepareRow(row)
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    })}
                                </tr>
                            )
                        })}
                        <tr>
                            {loading ? (
                                // Use our custom loading state to show a loading indicator
                                <td colSpan="10000">Loading...</td>
                            ) : (
                                <td colSpan="10000">
                                    Showing {page.length} of {totalCount}{' '}
                                    results
                                </td>
                            )}
                        </tr>
                    </tbody>
                </table>
                <div className="pagination">
                    <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                        {'<<'}
                    </button>{' '}
                    <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                        {'<'}
                    </button>{' '}
                    <button onClick={() => nextPage()} disabled={!canNextPage}>
                        {'>'}
                    </button>{' '}
                    <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                        {'>>'}
                    </button>{' '}
                    <span>
                        Page{' '}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>{' '}
                    </span>
                    <span>
                        | Go to page:{' '}
                        <input
                            type="number"
                            defaultValue={pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0
                                gotoPage(page)
                            }}
                            style={{ width: '100px' }}
                        />
                    </span>{' '}
                    <select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value))
                        }}
                    >
                        {[10, 20, 30, 40, 50, 75, 100].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Show {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="section section-invisible"></div>
            <div className="deleteConditions">
                <div>
                    <strong>
                        <span>Delete options{' '}</span>
                    </strong >
                </div>
                <span>
                    <input
                        type="checkbox"
                        checked={preventDeleteWithMessages}
                        onChange={e => {
                            setPreventDeleteWithMessages(!preventDeleteWithMessages);
                        }}
                    />
                    do not delete queues containing messages{' '}
                </span>
                <span>
                    <input
                        type="checkbox"
                        checked={preventDeleteWithConsumers}
                        onChange={e => {
                            setPreventDeleteWithConsumers(!preventDeleteWithConsumers);
                        }}
                    />
                    do not delete queues with consumers{' '}
                </span>
            </div>
            <div className="section section-invisible"></div>
            <div className="queuesButtons">
                <input type="submit" onClick={deleteQueues} value="Delete selected queues"></input>
                <input type="submit" onClick={purgeQueues} value="Purge selected queues"></input>
            </div>
        </div >
    )

    async function deleteQueues(event) {
        if (!selectedFlatRows.length) {
            return;
        }

        await onDeleteQueues(selectedFlatRows, preventDeleteWithMessages, preventDeleteWithConsumers);
        await fetchData({ pageIndex, pageSize, filter, useRegex, sortBy });
    }

    async function purgeQueues(event) {
        if (!selectedFlatRows.length) {
            return;
        }

        await onPurgeQueues(selectedFlatRows);
        await fetchData({ pageIndex, pageSize, filter, useRegex, sortBy });
    }
}
export default QueuesTable;