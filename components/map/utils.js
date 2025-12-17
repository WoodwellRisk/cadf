export const updatePaintProperty = (map, ref, key, value) => {
    const { current: id } = ref
    if (map.getLayer(id)) {
        map.setPaintProperty(id, key, value)
    }
}

// https://www.delftstack.com/howto/javascript/rgb-to-hex-javascript/
export const rgbArrayToHex = (rgbArray) => {
    return rgbArray.map(rgb => {
        const [r, g, b] = rgb;
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase();
    });
}

// https://www.freecodecamp.org/news/javascript-range-create-an-array-of-numbers-with-the-from-method/
export const arrayRange = (start, stop, step) =>
    Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    )