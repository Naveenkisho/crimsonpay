async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'Request failed');
  return data;
}

export const getConfig = () => request(`/api/config${window.location.search}`);
export const postJson = (path, body) => request(path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});