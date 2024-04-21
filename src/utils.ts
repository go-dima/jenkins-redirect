export async function fetchJson(url: string | URL) {
  try {
    const response = await fetch(`${url}/api/json`);
    return await response.json();
  } catch (error) {
    return null;
  }
}
