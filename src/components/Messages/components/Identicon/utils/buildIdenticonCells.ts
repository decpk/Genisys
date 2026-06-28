// Build a 5x5 horizontally-symmetric on/off grid from the hash. Only the left
// three columns are derived; the right two mirror them for a balanced glyph.
export function buildIdenticonCells(hash: number): boolean[][] {
  const rows = 5
  const cols = 5
  const grid: boolean[][] = []
  let h = hash
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = new Array(cols).fill(false)
    for (let c = 0; c < 3; c++) {
      h = Math.imul(h ^ (r * 5 + c + 1), 0x01000193) >>> 0
      const on = ((h >> 4) & 1) === 1
      row[c] = on
      row[cols - 1 - c] = on
    }
    grid.push(row)
  }
  return grid
}
