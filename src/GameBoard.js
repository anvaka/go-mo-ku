import eventify from 'ngraph.events';
import Position from './Position.js';

/**
 * Game board stores game logic, without any dependencies on UI. It can be reused in
 * any platform and framework where javascript is supported.
 */
export default class GameBoard {
  constructor(width, height, winLength = 5, playerSymbols = 'XO') {
    this.width = width;
    this.height = height;
    this.winLength = winLength;
    this.positions = [];
    this.lookup = Object.create(null);

    // We use array destructuring here to access to unicode symbols.
    this.playerSymbols = [...playerSymbols];
    this.currentPlayer = 0;

    // This would turn GameBoard into event emitter, allowing us to create
    // loose coupling between components.
    eventify(this);
  }


  /**
   * Adjust size of the board. It cleans the current board.
   */
  resize(width, height) {
    this.clear();
    this.width = width;
    this.height = height;
  }

  /**
   * Update required length of the sequence to win.
   */
  setWinCondition(winLength) {
    this.winLength = winLength;
    this.fire('winLengthChanged');
  }


  play(x, y) {
    const cellPos = this.getPosition(x, y);
    if (cellPos && cellPos === this.getLastPlayedPosition()) {
      // can only undo the last move:
      this.undoLastMove();
    } else {
      this.placeSymbol(x, y);
    }
  }

  /**
   * Places a symbol at given position. If position is already occupied,
   * it returns false. Otherwise it returns true.
   */
  placeSymbol(x, y, symbol) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      throw new Error(`Invalid position ${x}, ${y}`);
    }

    if (this.getPosition(x, y)) {
      // Position is already taken
      return false;
    }

    if (!symbol) {
      symbol = this.playerSymbols[this.currentPlayer];
    }

    const pos = new Position(x, y, symbol);

    let row = this.lookup[y];
    if (!row) this.lookup[y] = row = {};
    let col = row[x];
    if (col) {
      // we should never reach hear, but in case if someone messed up the
      // `gethPosition()` check, we defensively throw.
      throw new Error(`Position ${x}, ${y} is already occupied`);
    }
    row[x] = pos;
    this.positions.push(pos);

    this.currentPlayer = this.positions.length % this.playerSymbols.length;

    this.fire('play');
    this.fire('change');

    return true;
  }

  /**
   * Returns last played position or null if there was no moves yet.
   */
  getLastPlayedPosition() {
    if (this.positions.length === 0) return null;
    return this.positions[this.positions.length - 1];
  }

  undoLastMove() {
    let last = this.getLastPlayedPosition();
    if (!last) return;

    let {x, y} = last;
    let row = this.lookup[y];
    delete row[x];

    this.positions.pop();
    this.currentPlayer = this.positions.length % this.playerSymbols.length;
    this.fire('remove', last);
    this.fire('change');
  }

  clear() {
    this.positions = [];
    this.lookup = Object.create(null);
    this.currentPlayer = 0;
    this.fire('clear');
    this.fire('change');
  }

  getNextMoveSymbol() {
    return this.playerSymbols[this.currentPlayer];
  }

  getPosition(x, y) {
    let row = this.lookup[y];
    if (!row) return;
    return row[x];
  }

  /**
   * This method will check the winner of the game. If there is no winner then
   * nothing is returned. Otherwise a {symbol, sequence} object is returned.
   */
  getWinner() {
    this.cleanWinnerCheck();

    // Note: This code is fast. It can be made even faster if we limit scope to
    // check positions within `winLength` range to the last played symbol.
    // 
    // The idea is to check every unchecked symbol and its adjacent symbols on vertical,
    // horizontal, diagonal, and anti-diagonal directions. 
    //
    // If length of the adjacent symbols in any direction is not less than `winLength`,
    // then we have a winner.
    //
    // As we check every played position, we mark it as checked based on direction of the check.
    // So that next time we visit it, we don't have to repeat the work. Fast and simple.
    for (let pos of this.positions) {
      let sequence = 
        filterWinner(getLongestSequence(pos, this, -1, 0, 1, 0, 'horizontalChecked'), this.winLength) ||
        filterWinner(getLongestSequence(pos, this, 0, -1,  0, 1, 'verticalChecked'), this.winLength) ||
        filterWinner(getLongestSequence(pos, this, -1, -1, 1, 1, 'lDiagonalChecked'), this.winLength) ||
        filterWinner(getLongestSequence(pos, this, -1,  1, 1, -1, 'rDiagonalChecked'), this.winLength);
      if (sequence) {
        return {
          symbol: this.getPosition(sequence[0][0], sequence[0][1]).symbol,
          sequence
        }
      }
    }
  }

  cleanWinnerCheck() {
    this.positions.forEach(pos => {
      pos.clean();
    });
  }
}

/**
 * This method will return a bounding box of the longest sequence of the same symbol in a given
 * direction. Direction is defined by "mirroring" strategy of board traversal. 
 * 
 * For example, if we are checking "horizontal" direction, we need to check everything to the left
 * (leftDx = -1, leftDy = 0) and to the right (rightDx = 1, rightDy = 0).
 * 
 * We use `checkName` to mark checked positions and eliminate repetitive work.
 */
function getLongestSequence(pos, board, leftDx, leftDy, rightDx, rightDy, checkName) {
  if (pos[checkName]) return; // already checked

  let minLeft = pos.x;
  let minTop = pos.y;

  let leftSymbol = board.getPosition(minLeft + leftDx, minTop + leftDy);
  pos[checkName] = true;

  while (leftSymbol && leftSymbol.symbol === pos.symbol) {
    minLeft += leftDx;
    minTop += leftDy;

    leftSymbol[checkName] = true;
    leftSymbol = board.getPosition(minLeft + leftDx, minTop + leftDy);
  }

  let maxRight = pos.x;
  let maxBottom = pos.y;
  let rightSymbol = board.getPosition(pos.x + rightDx, pos.y + rightDy);
  while (rightSymbol && rightSymbol.symbol === pos.symbol) {
    maxRight += rightDx;
    maxBottom += rightDy;
    rightSymbol[checkName] = true;
    rightSymbol = board.getPosition(maxRight + rightDx, maxBottom + rightDy);
  }

  return {minLeft, minTop, maxRight, maxBottom, dx: rightDx, dy: rightDy};
}

function filterWinner(boundingBox, consequentSymbolCountToWin) {
  if (!boundingBox) return; // No winner here.

  let {minLeft, minTop, maxRight, maxBottom, dx, dy} = boundingBox;

  let count = 0;
  let winner = [];
  let ySign = maxBottom > minTop ? 1 : -1;
  let x = minLeft; let y = minTop;
  while (x != maxRight || y != maxBottom) {
    winner.push([x, y]);
    x += dx;
    y += dy;
  }
  if (minLeft !== maxRight || minTop !== maxBottom) {
    winner.push([maxRight, maxBottom]);
  }
  if (winner.length >= consequentSymbolCountToWin) {
    return winner;
  }
}