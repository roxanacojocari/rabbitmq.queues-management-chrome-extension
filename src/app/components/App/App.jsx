import React, { Component } from "react";
import axios from "axios";

import QueuesTable from "../QueuesTable/QueuesTable.jsx";
import getColumns from "../../helpers/columns.js";
import { retrieveQueues, deleteQueue, purgeQueue } from "../../helpers/api.js"
import regeneratorRuntime from "regenerator-runtime"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: getColumns(),
      data: [],
      loading: false,
      pageCount: 0,
      totalCount: 0
    };
    this.fetchIdRef = React.createRef(0);
  }

  fetchQueues = async ({ pageSize, pageIndex, filter, useRegex, sortBy }) => {
    // This will get called when the table needs new data
    let fetchId = ++this.fetchIdRef.current;

    this.setState({
      loading: true
    });

    // Only update the data if this is the latest fetch
    if (fetchId === this.fetchIdRef.current) {
      let options = { page: ++pageIndex, pageSize, name: filter, useRegex };

      if (sortBy && sortBy.length)
        options = { ...options, sort: sortBy[0].id, sortReverse: sortBy[0].desc };

      const response = await retrieveQueues(this.props.config.authHeader, options);

      this.setState({
        data: response.data.items,
        pageCount: response.data.page_count,
        totalCount: response.data.filtered_count,
        loading: false
      });
    }
  }

  deleteQueues = async (queues, ifEmpty, ifUnused) => {
    const settled = await Promise.allSettled(queues.map(queue => deleteQueue(this.props.config.authHeader, queue.vhost, queue.name, ifEmpty, ifUnused)));
    const fulfilled = settled
      .filter(s => s.status === 'fulfilled');

    const successes = fulfilled.filter(x => !x.value.data.error);
    const failures = fulfilled.filter(x => x.value.data.error).map(x => x.value.data.reason);
    console.log(`Deleted ${successes.length} queue(s)`)
    if (failures.length)
      console.log(`Unable to delete because ${failures.join(' and ')}`)

    if (settled.length !== fulfilled.length) {
      const errors = settled
        .filter(s => s.status === 'rejected')
        .map(p => p.reason)
        .join(';');
      console.log(`Some errors have occurred deleting the queue(s): ${errors}`)
    }
  }

  purgeQueues = async (queues) => {
    const settled = await Promise.allSettled(queues.map(queue => purgeQueue(this.props.config.authHeader, queue.vhost, queue.name)));
    const fulfilled = settled
      .filter(s => s.status === 'fulfilled');

    const successes = fulfilled.filter(x => !x.value.data.error);
    const failures = fulfilled.filter(x => x.value.data.error).map(x => x.value.data.reason);
    console.log(`Purged ${successes.length} queue(s)`)
    if (failures.length)
      console.log(`Unable to purge because ${failures.join(' and ')}`)

    if (settled.length !== fulfilled.length) {
      const errors = settled
        .filter(s => s.status === 'rejected')
        .map(p => p.reason)
        .join(';');
      console.log(`Some errors have occurred purging the queue(s): ${errors}`)
    }
  }

  onDeleteQueues = async (selectedRows, ifEmpty, ifUnused) => {
    const queues = selectedRows.map(selectedRow => { return { name: selectedRow.original.name, vhost: selectedRow.original.vhost } })
    await this.deleteQueues(queues, ifEmpty, ifUnused);
  }

  onPurgeQueues = async (selectedRows) => {
    const queues = selectedRows.map(selectedRow => { return { name: selectedRow.original.name, vhost: selectedRow.original.vhost } })
    await this.purgeQueues(queues);
  }

  componentDidMount = () => {

  }

  render = () => {
    return (
      <div>
        <QueuesTable
          data={this.state.data}
          columns={this.state.columns}
          onDeleteQueues={this.onDeleteQueues}
          onPurgeQueues={this.onPurgeQueues}
          fetchData={this.fetchQueues}
          loading={this.state.loading}
          pageCount={this.state.pageCount}
          totalCount={this.state.totalCount} />
      </div>
    );
  }
}

export default App;