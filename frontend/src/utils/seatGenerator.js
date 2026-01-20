export const generateSeatGrid = (rows, cols, defaultType = "standard") => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 1; c <= cols; c++) {
            seats.push({ row: rowLetter, col: c, type: defaultType });
        }
    }
    return seats;
}