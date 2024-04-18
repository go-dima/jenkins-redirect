export async function fetchJson(url: string | URL) {
  const response = await fetch(`${url}/api/json`);
  return await response.json();
}
