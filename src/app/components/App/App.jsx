import React, { useCallback, useState } from 'react';
import QueuesTable from '../QueuesTable/QueuesTable.jsx';
import getColumns from '../../helpers/columns.js';
import { retrieveQueues, deleteQueue, purgeQueue } from '../../helpers/api.js';
import regeneratorRuntime from 'regenerator-runtime';

function App ({ config }) {
  const { authHeader, timerInterval } = config;
  const [columns] = useState(getColumns());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const fetchIdRef = React.createRef(0);

  const fetchData = useCallback(({ pageSize, pageIndex, filter, useRegex, sortBy }) => {
    async function fetchQueues ({ pageSize, pageIndex, filter, useRegex, sortBy }) {
      // This will get called when the table needs new data
      const fetchId = ++fetchIdRef.current;

      setLoading(true);

      // Only update the data if this is the latest fetch
      if (fetchId === fetchIdRef.current) {
        let options = { page: ++pageIndex, pageSize, name: filter, useRegex };

        if (sortBy && sortBy.length) { options = { ...options, sort: sortBy[0].id, sortReverse: sortBy[0].desc }; }

        const response = await retrieveQueues(authHeader, options);

        setData(response.data.items);
        setPageCount(response.data.page_count);
        setTotalCount(response.data.filtered_count);
        setLoading(false);
      }
    }

    fetchQueues({ pageSize, pageIndex, filter, useRegex, sortBy });
  }, []);

  const onDeleteQueues = useCallback((selectedRows, ifEmpty, ifUnused) => {
    async function deleteQueues (queues, ifEmpty, ifUnused) {
      const settled = await Promise.allSettled(queues.map(queue => deleteQueue(authHeader, queue.vhost, queue.name, ifEmpty, ifUnused)));
      const fulfilled = settled
        .filter(s => s.status === 'fulfilled');

      const successes = fulfilled.filter(x => !x.value.data.error);
      const failures = fulfilled.filter(x => x.value.data.error).map(x => x.value.data.reason);
      console.log(`Deleted ${successes.length} queue(s)`);
      if (failures.length) { console.log(`Unable to delete because ${failures.join(' and ')}`); }

      if (settled.length !== fulfilled.length) {
        const errors = settled
          .filter(s => s.status === 'rejected')
          .map(p => p.reason)
          .join(';');
        console.log(`Some errors have occurred deleting the queue(s): ${errors}`);
      }
    }

    const queues = selectedRows.map(selectedRow => { return { name: selectedRow.original.name, vhost: selectedRow.original.vhost }; });
    deleteQueues(queues, ifEmpty, ifUnused);
  }, []);

  const onPurgeQueues = useCallback((selectedRows) => {
    async function purgeQueues (queues) {
      const settled = await Promise.allSettled(queues.map(queue => purgeQueue(authHeader, queue.vhost, queue.name)));
      const fulfilled = settled
        .filter(s => s.status === 'fulfilled');

      const successes = fulfilled.filter(x => !x.value.data.error);
      const failures = fulfilled.filter(x => x.value.data.error).map(x => x.value.data.reason);
      console.log(`Purged ${successes.length} queue(s)`);
      if (failures.length) { console.log(`Unable to purge because ${failures.join(' and ')}`); }

      if (settled.length !== fulfilled.length) {
        const errors = settled
          .filter(s => s.status === 'rejected')
          .map(p => p.reason)
          .join(';');
        console.log(`Some errors have occurred purging the queue(s): ${errors}`);
      }
    }

    const queues = selectedRows.map(selectedRow => { return { name: selectedRow.original.name, vhost: selectedRow.original.vhost }; });
    purgeQueues(queues);
  }, []);

  return (
    <div>
      <QueuesTable
        data={data}
        columns={columns}
        onDeleteQueues={onDeleteQueues}
        onPurgeQueues={onPurgeQueues}
        fetchData={fetchData}
        loading={loading}
        pageCount={pageCount}
        totalCount={totalCount}
        refreshInterval={timerInterval}
      />
    </div>
  );
}

export default App;
