import clamp from './utils/clamp.js';

export default class GameCursor {
  constructor(container, board, cellSize) {
    this.board = board;
    this.cellSize = cellSize;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.style.position = 'absolute';
    cursor.style.width = (cellSize - 1) + 'px';
    cursor.style.height = (cellSize - 1) + 'px';
    container.appendChild(cursor);

    this.cursor = cursor;
    this.renderAt(0, 0);
  }

  renderAt(cellX, cellY) {
    cellX = clamp(cellX, 0, this.board.width - 1);
    cellY = clamp(cellY, 0, this.board.height - 1);
    this.lastX = cellX;
    this.lastY = cellY;
    this.cursor.style.left = (cellX * this.cellSize + 1) + 'px';
    this.cursor.style.top = (cellY * this.cellSize + 1) + 'px';
  }
}
