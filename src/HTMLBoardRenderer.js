import HTMLBoardInputHandler from './HTMLBoardInputHandler.js';

/**
 * Renders the board with plain HTML. This renderer shows the power of 
 * concern separation. If we ever decide that HTML isn't fast enough
 * to render huge boards, we can switch to a different renderer.
 * 
 * We can implement virtualization, use Canvas, or even render the board
 * as a console application
 */
export default class HTMLBoardRenderer {
  constructor(container, board) {
    // First let's remember the board and the container and setup the rendering state.
    this.container = container;
    this.board = board;
    this.cellUISize = Math.min(42, Math.max(36, (window.innerWidth / board.width)));
    // Map between game model positions and UI element that represent them.
    this.renderedPositions = new Map();

    // Input handling comes in many forms (e.g. keyboard, mouse, touch, etc.)
    // Having input handling in a separate class allows developers to
    // easily extend the input, and keep rendering code simple:
    this.inputHandler = new HTMLBoardInputHandler(container, board, this.cellUISize);

    // Now let's make sure that everything is ready to be rendered as game changes
    // And render the board.
    this.listenToEvents();

    // Look inside this method, it might surprise you by its simplicity:
    this.renderBackgroundGrid();
    this.renderPositions();
    this.showLastMove();
  }

  /**
   * Listen to events that come from the board and change the UI.
   */
  listenToEvents() {
    this.board.on('play', this.renderPositions, this);
    this.board.on('remove', this.removePosition, this);
    this.board.on('clear', this.clear, this);
    this.board.on('winLengthChanged', this.renderPositions, this);
  }

  /**
   * dispose() and listenToEvents() methods are best kept next to each other.
   * So that we don't forget to unsubscribe from events at the end of life.
   */
  dispose() {
    this.container.innerText = '';
    this.board.off('play', this.renderPositions);
    this.board.off('remove', this.removePosition);
    this.board.off('clear', this.clear);
    this.board.off('winLengthChanged', this.renderPositions, this);
    this.inputHandler.dispose();
  }

  showLastMove() {
    const lastMove = document.querySelector('.last-move');
    if (lastMove) lastMove.scrollIntoView();
  }

  focus() {
    this.container.focus();
  }

  renderBackgroundGrid() {
    // Instead of rendering individual cells of the board, we actually render a single
    // div element, with a gradient background defined as a step-function.
    // For this to work, we need to pass background size and adjust the dimensions of the
    // container.
    //
    // See #board {} in style.css for the definition of the gradient.
    this.container.style.width =  (1 + this.board.width  * this.cellUISize) + 'px';
    this.container.style.height = (1 + this.board.height * this.cellUISize) + 'px';
    this.container.style.backgroundSize = this.cellUISize + 'px ' + this.cellUISize + 'px';
  }

  clear() {
    this.renderedPositions.forEach((positionElement) => {
      positionElement.parentElement.removeChild(positionElement);
    });
    this.renderedPositions.clear();
    this.renderPositions();
  }

  removePosition(position) {
    let element = this.renderedPositions.get(position);
    if (!element) return; // already removed;
    element.parentElement.removeChild(element);
    this.renderedPositions.delete(position);

    this.renderWinner();
    this.highlightLastMove();
  }

  renderPositions() {
    this.board.positions.forEach((position) => {
      if (this.renderedPositions.get(position)) return; // already rendered;
      let positionElement = createPositionElement(position, this.cellUISize, this.container);
      this.renderedPositions.set(position, positionElement);
    });

    this.renderWinner();
    this.highlightLastMove();
  }

  renderWinner() {
    Array.from(this.container.querySelectorAll('.winner')).forEach(x => {
      x.classList.remove('winner');
    });

    const winner = this.board.getWinner();
    if (winner) {
      winner.sequence.forEach(([cellX, cellY]) => {
        const position = this.board.getPosition(cellX, cellY);
        this.renderedPositions.get(position).classList.add('winner');
      })
    } 
  }

  highlightLastMove() {
    Array.from(this.container.querySelectorAll('.last-move')).forEach(x => x.classList.remove('last-move'));

    const lastMove = this.board.getLastPlayedPosition();
    if (lastMove) this.renderedPositions.get(lastMove).classList.add('last-move');
  }
}

function createPositionElement(position, size, container) {
  let positionElement = document.createElement('div');
  positionElement.className = 'symbol';
  positionElement.style.width =  (size - 1) + 'px';
  positionElement.style.height = (size - 1) + 'px';
  positionElement.style.left = (1 + position.x * size) + 'px';
  positionElement.style.top =  (1 + position.y * size) + 'px';
  positionElement.style.fontSize = size + 'px';
  positionElement.style.lineHeight = size + 'px';
  positionElement.innerText = position.symbol;

  container.appendChild(positionElement);
  return positionElement;
}