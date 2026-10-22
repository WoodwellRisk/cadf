export async function fontToDataUri(fontPath) {
  const response = await fetch(fontPath);
  if (!response.ok) throw new Error(`Unable to load ${fontPath}`);

  const buffer = await response.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  const binary = String.fromCharCode(...uint8);
  const base64 = btoa(binary);

  return `data:font/ttf;charset=utf-8;base64,${base64}`;
}

// provide min / max bounds to number
// export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const clamp = (value, min, max) => (value > max ? max : value < min ? min : value);
