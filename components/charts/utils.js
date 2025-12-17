export async function fontToDataUri(fontPath) {
  const response = await fetch(fontPath);
  if (!response.ok) throw new Error(`Unable to load ${fontPath}`);

  const buffer = await response.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const binary = String.fromCharCode(...uint8);
  const base64 = btoa(binary);

  return `data:font/ttf;charset=utf-8;base64,${base64}`;
}