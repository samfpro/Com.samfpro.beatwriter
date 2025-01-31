class ModeArrange {
  constructor(gridView) {
    this.gridView = gridView; // Use GridViewModule instance directly
    this.moveFromIndex = null;
    this.moveToIndex = null;
  }

  handleGridCellClick(cellIndex) {
    console.log("Attempting to handle arrange mode click");

    if (this.moveFromIndex === null) {
      this.moveFromIndex = cellIndex;
      console.log("Set moveFromIndex to", this.moveFromIndex);
      this.highlightPossibleMoves(cellIndex);
    } else {
      if (this.gridView.cells[cellIndex].isCandidate === true) {
        this.moveToIndex = cellIndex;
        console.log("Set moveToIndex to", this.moveToIndex);
        this.performMove();
        this.resetCandidateCells();
        this.moveFromIndex = null;
        this.moveToIndex = null;
      }
    }
  }

  highlightPossibleMoves(cellIndex) {
    cellIndex = parseInt(cellIndex);
    console.log("Highlighting possible moves...");
    let blanksToRight = this.countBlanksToRight(cellIndex);
    let blanksToLeft = this.countBlanksToLeft(cellIndex);
    console.log("Blanks to the right:", blanksToRight);
    console.log("Blanks to the left:", blanksToLeft);

    // Highlight possible moves to the right
    for (let i = 1; i <= blanksToRight; i++) {
      this.gridView.cells[cellIndex + i].isCandidate = true;
    }

    // Highlight possible moves to the left
    for (let i = 1; i <= blanksToLeft; i++) {
      this.gridView.cells[cellIndex - i].isCandidate = true;
    }
  }

  countBlanksToRight(cellIndex) {
    console.log("Counting blanks to the right...");
    let rowEnd = (Math.floor(cellIndex / 16) * 16) + 16;
    console.log("rowEnd: " + rowEnd);
    console.log("cell index: " + cellIndex);
    let firstCellToRight = cellIndex + 1;
    console.log("firstCellToRight: " + firstCellToRight);

    let blanks = 0;

    for (let i = firstCellToRight; i < rowEnd; i++) {
      console.log("counting, i= " + i + "rowEnd = " + rowEnd);

      if (this.gridView.cells[i].syllable.trim() === "") {
        console.log("syllable: " + this.gridView.cells[i].syllable.trim());
        blanks++;
      }
    }

    console.log("Found", blanks, "blanks to the right.");
    return blanks;
  }

  countBlanksToLeft(cellIndex) {
    console.log("Counting blanks to the left...");
    const rowStart = Math.floor(cellIndex / 16) * 16;
    let blanks = 0;

    for (let i = cellIndex - 1; i >= rowStart; i--) {
      if (this.gridView.cells[i].syllable.trim() === "") {
        blanks++;
      }
    }

    console.log("Found", blanks, "blanks to the left.");
    return blanks;
  }

  performMove() {
    console.log("Performing move...");

    const moveDistance = this.moveToIndex - this.moveFromIndex;
    const blanksToMove = Math.abs(moveDistance);
    console.log("Move distance:", moveDistance);
    console.log("Blanks to move:", blanksToMove);

    const syllablesArray = this.gridView.cells.map(cell => cell.syllable);

    if (moveDistance > 0) {
      // Moving to the right
      this.moveSyllablesRight(syllablesArray, blanksToMove);
    } else if (moveDistance < 0) {
      // Moving to the left
      this.moveSyllablesLeft(syllablesArray, blanksToMove);
    }

    // Update the syllables property in gridView.cells
    this.gridView.cells.forEach((cell, index) => {
      cell.syllable = syllablesArray[index];
    });
  }

  moveSyllablesRight(syllablesArray, blanksToMove) {
    let blanksRemoved = 0;
    for (let i = this.moveFromIndex; i < syllablesArray.length && blanksRemoved < blanksToMove; i++) {
      if (syllablesArray[i].trim() === '') {
        syllablesArray.splice(i, 1);
        blanksRemoved++;
        i--;
      }
    }
    syllablesArray.splice(this.moveFromIndex, 0, ...Array(blanksToMove).fill(''));
  }

  moveSyllablesLeft(syllablesArray, blanksToMove) {
    let blanksRemoved = 0;
    for (let i = this.moveFromIndex; i >= 0 && blanksRemoved < blanksToMove; i--) {
      if (syllablesArray[i].trim() === '') {
        syllablesArray.splice(i, 1);
        blanksRemoved++;
        i++;
      }
    }
    syllablesArray.splice(this.moveToIndex + 1, 0, ...Array(blanksToMove).fill(''));
  }

  resetCandidateCells() {
    this.gridView.cells.forEach(cell => {
      cell.isCandidate = false;
    });
  }
}

console.log("modeArrange.js loaded");