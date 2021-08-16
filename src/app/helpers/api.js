import axios from 'axios';

async function retrieveQueues (authorization, { page, pageSize, name, useRegex, sort, sortReverse }) {
  const regex = useRegex ? 'true' : 'false';
  const encodedName = name ? encodeURIComponent(name) : '';
  let url = `/api/queues?page=${page}&page_size=${pageSize}&name=${encodedName}&use_regex=${regex}&pagination=true`;

  if (sort) {
    const encodedSortProperty = encodeURIComponent(sort);
    url = `/api/queues?page=${page}&page_size=${pageSize}&name=${encodedName}&use_regex=${regex}&sort=${encodedSortProperty}&sort_reverse=${sortReverse}&pagination=true`;
  }

  return axios({
    method: 'get',
    url: url,
    withCredentials: true,
    headers: { authorization }
  });
}
async function deleteQueue (authorization, vhost, name, ifEmpty, ifUnused) {
  const encodedName = encodeURIComponent(name);
  const encodedVHost = encodeURIComponent(vhost);
  let url = `/api/queues/${encodedVHost}/${encodedName}`;

  // query string parameters if-empty=true and / or if-unused=true
  // These prevent the delete from succeeding if the queue contains messages, or has consumers, respectively.
  if (ifEmpty) {
    url = `${url}?if-empty=true`;
  }

  if (ifUnused) {
    url = `${url}${ifEmpty ? '&' : '?'}if-unused=true`;
  }

  try {
    const response = await axios({
      method: 'delete',
      url: url,
      withCredentials: true,
      headers: { authorization }
    });
    return response;
  } catch (err) {
    if (err.response.status === 400 && (ifEmpty || ifUnused)) { return err.response; } else { throw err; }
  }
}

async function purgeQueue (authorization, vhost, name) {
  const encodedName = encodeURIComponent(name);
  const encodedVHost = encodeURIComponent(vhost);
  const url = `/api/queues/${encodedVHost}/${encodedName}/contents`;

  return axios({
    method: 'delete',
    url: url,
    withCredentials: true,
    headers: { authorization }
  });
}

export { retrieveQueues, deleteQueue, purgeQueue };
