import GameCursor from './GameCursor.js';
import clamp from './utils/clamp.js';

/**
 * This class manages user input and updates the game cursor/board.
 */
export default class HTMLBoardInputHandler {
  constructor(container, board, cellUISize) {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.container = container;
    this.board = board;
    this.gameCursor = new GameCursor(container, board, cellUISize); 
    this.cellUISize = cellUISize;
    this.listenToEvents();
  }

  listenToEvents() {
    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('click', this.onClick);
    this.container.addEventListener('keydown', this.onKeyDown);
  }

  dispose() {
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('click', this.onClick);
    this.container.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(e) {
    if (e.metaKey || e.ctrlKey) return; // if command key is down - ignore

    if (e.keyCode === 32 || e.keyCode === 13) { // space or enter
      this.board.play(this.gameCursor.lastX, this.gameCursor.lastY);
      e.preventDefault();
    } else if (e.keyCode === 37 || e.keyCode === 65 || e.keyCode === 72) { // left or A or H
      this.gameCursor.renderAt(this.gameCursor.lastX - 1, this.gameCursor.lastY, true);
      e.preventDefault();
    } else if (e.keyCode === 38 || e.keyCode === 87 || e.keyCode === 75) { // up or W or K
      this.gameCursor.renderAt(this.gameCursor.lastX, this.gameCursor.lastY - 1, true);
      e.preventDefault();
    } else if (e.keyCode === 39 || e.keyCode === 68 || e.keyCode === 76) { // right or D or L
      this.gameCursor.renderAt(this.gameCursor.lastX + 1, this.gameCursor.lastY, true);
      e.preventDefault();
    } else if (e.keyCode === 40 || e.keyCode === 83 || e.keyCode === 74) { // down or S or J
      this.gameCursor.renderAt(this.gameCursor.lastX, this.gameCursor.lastY + 1, true);
      e.preventDefault();
    } else if (e.keyCode === 48) { // 0 - vim for the start of line
      this.gameCursor.renderAt(0, this.gameCursor.lastY, true);
      e.preventDefault();
    } else if (e.keyCode === 52) { // $ - vim for the end of line
      this.gameCursor.renderAt(this.board.width - 1, this.gameCursor.lastY, true);
      e.preventDefault();
    }
  }

  onMouseMove(e) {
    const pos = this.getCellPosition(e);
    this.gameCursor.renderAt(pos.x, pos.y);
  }

  onClick(e) {
    e.preventDefault();
    const pos = this.getCellPosition(e);
    this.board.play(pos.x, pos.y);
  }

  getCellPosition(e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return { 
      x: clamp(Math.floor(x / this.cellUISize), 0, this.board.width - 1),
      y: clamp(Math.floor(y / this.cellUISize), 0, this.board.height - 1) 
    };
  }
}
