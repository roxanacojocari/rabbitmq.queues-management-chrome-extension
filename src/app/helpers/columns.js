import React from 'react';
import IndeterminateCheckbox from '../components/IndeterminateCheckbox/IndeterminateCheckbox';

function getColumns () {
  return [
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
      )
    },
    {
      Header: 'Overview',
      columns: [
        {
          Header: 'Name',
          accessor: 'name'
        },
        {
          Header: 'Consumers',
          accessor: 'consumers'
        },
        {
          Header: 'State',
          accessor: 'state'
        }
      ]
    },
    {
      Header: 'Messages',
      columns: [
        {
          Header: 'Ready',
          accessor: 'messages_ready'
        },
        {
          Header: 'Unacked',
          accessor: 'messages_unacknowledged'
        },
        {
          Header: 'In Memory',
          accessor: 'messages_ready_ram'
        },
        {
          Header: 'Persistent',
          accessor: 'messages_persistent'
        },
        {
          Header: 'Total',
          accessor: 'messages'
        }
      ]
    },
    {
      Header: 'Message bytes',
      columns: [
        {
          Header: 'Ready',
          accessor: 'message_bytes_ready'
        },
        {
          Header: 'Unacked',
          accessor: 'message_bytes_unacknowledged'
        },
        {
          Header: 'In Memory',
          accessor: 'message_bytes_ram'
        },
        {
          Header: 'Persistent',
          accessor: 'message_bytes_persistent'
        },
        {
          Header: 'Total',
          accessor: 'message_bytes'
        }
      ]
    }
  ];
}

export default getColumns;
