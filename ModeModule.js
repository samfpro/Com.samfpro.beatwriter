

class ModeModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this._mode = MODE_WRITE; // Initialize to null
    this.modeLights = [];
    this.branchLights = { top: null, bottom: null };
    this.previousMode = MODE_ARRANGE;
    console.log("ModeModule initialized with previousMode set to MODE_ARRANGE");
  }

  setupDOM() {
    super.setupDOM();

    // Get DOM elements
    this.moduleContent.id = "mode-module-content";
    this.modeToggleButton = this.moduleContent.querySelector("#mode-toggle-button");
    this.modeLights.push(this.moduleContent.querySelector("#light-mode-write"));
    this.modeLights.push(this.moduleContent.querySelector("#light-mode-arrange"));
    this.modeLights.push(this.moduleContent.querySelector("#light-mode-play"));
    this.branchLights.top = this.moduleContent.querySelector("#branch-light-top");
    this.branchLights.bottom = this.moduleContent.querySelector("#branch-light-bottom");

    console.log("DOM elements fetched and assigned:", {
      modeToggleButton: this.modeToggleButton,
      modeLights: this.modeLights,
      branchLights: this.branchLights
    });

    // Set up event listeners if elements exist
    this.modeToggleButton?.addEventListener("click", () => this.toggleMode(false));
  }
    
  toggleMode(onPlay){
    if(onPlay == false){
      console.log("Mode toggle button clicked");
      console.log("Previous mode saved: " + this.previousMode);
      if (this._mode == MODE_WRITE){
        this._mode = MODE_ARRANGE;
        this.previousMode = MODE_WRITE;
      }else if (this._mode == MODE_ARRANGE){
        this._mode = MODE_WRITE;
        this.previousMode = MODE_ARRANGE;
        
      }else if (this._mode == MODE_PLAY){
        this._mode = this.previousMode;
      }
    }else{
        this.previousMode = this._mode;
      this._mode = MODE_PLAY;
    }
    this.toggleLights();
    this.app.getModule("gridView").cells.forEach((cell, index) => {
      cell.mode = this._mode;
    });
    console.log(`Mode toggled to: ${this._mode}`);
  }

  toggleLights() {
    console.log("Toggling lights...");

    // Reset previous mode light
    this.modeLights[this.previousMode]?.classList.remove("light-active");
    console.log(`Previous mode light (${this.previousMode}) deactivated`);
    
    // Activate current mode light
    this.modeLights[this._mode]?.classList.add("light-active");
    console.log(`Current mode light (${this._mode}) activated`);

    // Reset branch lights
    console.log("Resetting branch lights...");

    // Activate appropriate branch light
    if (this._mode === MODE_WRITE) {
      console.log("Activating MODE_WRITE branch lights");
      this.branchLights.top.style.borderTopWidth = "2px";
      this.branchLights.top.style.borderRightWidth = "2px";
      this.branchLights.top.style.borderBottomWidth = "2px";
      this.branchLights.bottom.style.borderBottomWidth = "2px";
      this.branchLights.bottom.style.borderRightWidth = "2px";
      this.branchLights.top.style.borderTopColor = "greenyellow";
      this.branchLights.top.style.borderRightColor = "greenyellow";
      this.branchLights.top.style.borderBottomColor = "black";
      this.branchLights.bottom.style.borderBottomColor = "black";
      this.branchLights.bottom.style.borderRightColor = "black";
    }else if (this._mode === MODE_ARRANGE) {
      console.log("Activating MODE_ARRANGE branch lights");
      this.branchLights.top.style.borderBottomColor = "greenyellow";
      this.branchLights.top.style.borderRightColor = "black";
      this.branchLights.top.style.borderTopColor = "black";
      this.branchLights.top.style.borderRightColor = "black";
    }else if(this._mode === MODE_PLAY){
      this.branchLights.top.style.borderBottomColor = "black";
      this.branchLights.top.style.borderTopColor = "black";
      this.branchLights.top.style.borderRightColor = "black";
      this.branchLights.bottom.style.borderBottomColor = "greenyellow";
      this.branchLights.bottom.style.borderRightColor = "greenyellow";
    }
    console.log(`Previous mode updated to: ${this.previousMode}`);
  }

  get mode() {
    console.log(`Getting mode: ${this._mode}`);
    return this._mode;
  }
  
  set mode(value) {
    this._mode = value;
    if (this.mode == MODE_WRITE || this.mode == MODE_ARRANGE){
      this.toggleMode(false);
    }else{
      this.toggleMode(true);
    }
  }
}