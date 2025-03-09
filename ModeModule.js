class ModeModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this._mode = MODE_WRITE; // Initial mode
    this.modeLights = [];
    this.branchLights = { top: null, bottom: null };
    this.previousMode = null; // Initialize with current mode
  }

  setupDOM() {
    super.setupDOM();
    this.moduleContent.id = "mode-module-content";
    
    // Get DOM elements
    this.modeToggleButton = this.moduleContent.querySelector("#mode-toggle-button");
    this.modeLights.push(
      this.moduleContent.querySelector("#light-mode-write"),
      this.moduleContent.querySelector("#light-mode-arrange"),
      this.moduleContent.querySelector("#light-mode-play")
    );
    this.branchLights.top = this.moduleContent.querySelector("#branch-light-top");
    this.branchLights.bottom = this.moduleContent.querySelector("#branch-light-bottom");

    // Event listeners
    this.modeToggleButton?.addEventListener("click", () => this.toggleMode());
    this.updateUI();
    this.updateGridCells();
  }

  // Handle button toggles between write/arrange
  toggleMode() {
    if (this._mode === MODE_PLAY) return; // Ignore if in play mode

    const newMode = this._mode === MODE_WRITE ? MODE_ARRANGE : MODE_WRITE;
    this.previousMode = this._mode;
    this._mode = newMode;
    
    this.updateUI();
    this.updateGridCells();
  }

  // Handle mode changes (including play mode)
  set mode(value) {
    if (value === this._mode) return;

    if (value === MODE_PLAY) {
      this.previousMode = this._mode; // Save current mode before switching
      this._mode = MODE_PLAY;
    } else if ([MODE_WRITE, MODE_ARRANGE].includes(value)) {
      this._mode = value;
    }

    this.updateUI();
    this.updateGridCells();
  }

  // Unified UI update method
  // ... (constructor and other methods remain the same)

  resetBorders() {
    // Set all borders to initial state (black with proper widths)
    const resetTop = element => {
      element.style.borderTop = '2px solid black';
      element.style.borderRight = '2px solid black';
      element.style.borderBottom = '2px solid black';
    };

    const resetBottom = element => {
      element.style.borderRight = '2px solid black';
      element.style.borderBottom = '2px solid black';
    };

    resetTop(this.branchLights.top);
    resetBottom(this.branchLights.bottom);
  }

  updateUI() {
    // Update mode indicator lights
    this.modeLights.forEach(light => light.classList.remove("light-active"));
    this.modeLights[this._mode]?.classList.add("light-active");

    // Reset all borders first
    this.resetBorders();

    // Apply active borders
    switch (this._mode) {
      case MODE_WRITE:
        this.branchLights.top.style.borderTop = '2px solid greenyellow';
        this.branchLights.top.style.borderRight = '2px solid greenyellow';
        this.branchLights.top.style.borderBottom = '2px solid black'; // Explicit reset
        break;
        
      case MODE_ARRANGE:
        this.branchLights.top.style.borderBottom = '2px solid greenyellow';
        break;
        
      case MODE_PLAY:
        this.branchLights.bottom.style.borderRight = '2px solid greenyellow';
        this.branchLights.bottom.style.borderBottom = '2px solid greenyellow';
        break;
    }
  }


  updateGridCells() {
    this.app.getModule("gridView").cells.forEach(cell => {
      cell.mode = this._mode;
    });
  }

  get mode() {
    return this._mode;
  }
}