const MODE_WRITE = 0;
const MODE_ARRANGE = 1;
const MODE_PLAY = 2;

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
    this.branchLights.top = this.moduleContent.querySelector("#branch-light-top");
    this.branchLights.bottom = this.moduleContent.querySelector("#branch-light-bottom");

    console.log("DOM elements fetched and assigned:", {
      modeToggleButton: this.modeToggleButton,
      modeLights: this.modeLights,
      branchLights: this.branchLights
    });

    // Set up event listeners if elements exist
  this.modeToggleButton?.addEventListener("click", () => {
  console.log("Mode toggle button clicked");
  this.previousMode = this._mode;
  console.log(`Previous mode saved: ${this.previousMode}`);

  // Toggle between write and arrange modes
  this.mode = this._mode === MODE_WRITE ? MODE_ARRANGE : MODE_WRITE;
  console.log(`Mode toggled to: ${this._mode}`);
});

    // Set a default mode after DOM setup
    this.mode = MODE_WRITE; // This will trigger the setter and toggleLights
    console.log("Default mode set to MODE_WRITE");

    console.log("Setup DOM for ModeModule completed");
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
    } else if (this._mode === MODE_ARRANGE) {
      console.log("Activating MODE_ARRANGE branch lights");
      this.branchLights.top.style.borderBottomColor = "greenyellow";
      this.branchLights.top.style.borderRightColor = "black";
      this.branchLights.top.style.borderTopColor = "black";
      this.branchLights.top.style.borderRightColor = "black";
    }
    
    console.log(`Previous mode updated to: ${this.previousMode}`);
  }

  get mode() {
    console.log(`Getting mode: ${this._mode}`);
    return this._mode;
  }

  set mode(value) {
    console.log(`Setting mode to: ${value}`);
    this._mode = value;
    if (value == MODE_WRITE){
      this.previousMode = MODE_ARRANGE;
    }else{
        this.previousMode = MODE_WRITE;
   
      }
    this.toggleLights(); // This will update the lights
    
    const pm = this.app.getModule("projectManager");
    console.log(pm);
    pm.updatePropertiesDisplay();
    console.log("Mode updated and lights toggled");
  }
}