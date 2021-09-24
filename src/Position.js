/**
 * Position holds coordinates of a symbol along with information about 
 * win condition checks.
 * 
 * See more in GameBoard.js file to learn about win condition algorithm
 * (getWinner() method).
 */
export default class Position {
  constructor(x, y, symbol) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
    this.lDiagonalChecked = false;
    this.rDiagonalChecked = false;
    this.horizontalChecked = false;
    this.verticalChecked = false;
  }

  clean() {
    this.lDiagonalChecked = false;
    this.rDiagonalChecked = false;
    this.horizontalChecked = false;
    this.verticalChecked = false;
  }
}
