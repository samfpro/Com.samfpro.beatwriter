const MODE_WRITE = 0;
const MODE_ARRANGE = 1;
const MODE_PLAY = 2;

class ModeModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.modeLights = [];
    this.branchLights = { top: null, bottom: null };
    this.previousMode = MODE_ARRANGE;
  }
  
  setupDOM() {
    super.setupDOM();

    // Get DOM elements
    this.moduleContent.id="mode-module-content";
    this.modeToggleButton = this.moduleContent.querySelector("#mode-toggle-button");
    this.modeLights.push(this.moduleContent.querySelector("#light-mode-write"));
    this.modeLights.push(this.moduleContent.querySelector("#light-mode-arrange"));
    this.branchLights.top = this.moduleContent.querySelector("#branch-light-top");
    this.branchLights.bottom = this.moduleContent.querySelector("#branch-light-bottom");

    // Set up event listeners if elements exist
    this.modeToggleButton?.addEventListener("click", () => {
      const diskModule = this.app.getModule("disk");
      this.previousMode = diskModule.mode;

      // Toggle only between write and arrange modes
      diskModule.mode = (this.previousMode === MODE_WRITE) ? MODE_ARRANGE : MODE_WRITE;

      this.toggleLights(diskModule.mode);
    });
    console.log("Setup DOM for ModeModule");
  }
  
  toggleLights(mode) {
    // Reset previous mode light
    this.modeLights[this.previousMode]?.classList.remove("mode-light-active");

    // Activate current mode light
    this.modeLights[mode]?.classList.add("mode-light-active");

    // Reset branch lights
    Object.values(this.branchLights).forEach(light => light.classList.remove("active"));

    // Activate appropriate branch light
    if (mode === MODE_WRITE){
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
    } else if (mode === MODE_ARRANGE){
      this.branchLights.top.style.borderBottomColor = "greenyellow";
      this.branchLights.top.style.borderRightColor = "black";

      this.branchLights.top.style.borderTopColor = "black";
      this.branchLights.top.style.borderRightColor = "black";
    }

    this.previousMode = mode;
  }
}