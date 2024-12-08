class App {
  constructor() {
    this.modules = {}; // Store module instances here
    this.initializationOrder = [
         {
        name: "title",
        class: FileManagerModule,
        args: [
          "About",
          "title-module",
          "html/titleModule.html", // Updated path
          document.getElementById("cp-top-row")
        ]
      },
      {
        name: "fileManager",
        class: FileManagerModule,
        args: [
          "File Manager",
          "file-manager-module",
          "html/fileManagerModule.html", // Updated path
          document.getElementById("cp-top-row")
        ]
      },
      {
        name: "beatTrack",
        class: BeatTrackModule,
        args: [
          "Beat Track",
          "beat-track-module",
          "html/beatTrackModule.html", // Updated path
          document.getElementById("cp-top-row")
        ]
      },
      {
        name: "waveFormView",
        class: WaveFormViewModule,
        args: [
          "Wave Form View",
          "wave-form-view-module",
          "html/waveFormViewModule.html", // Updated path
          document.getElementById("cp-wave-form-view")
        ]
      },
      {
        name: "gridView",
        class: GridViewModule,
        args: [
          "Grid View",
          "grid-view-module",
          "html/gridViewModule.html", // Updated path
          document.getElementById("cp-grid-view")
        ]
      },
      {
        name: "modeSelector",
        class: ModeModule,
        args: [
          "Mode Selector",
          "mode-module",
          "html/modeModule.html", // Updated path
          document.getElementById("cp-bottom-row")
        ]
      },
      {
        name: "transport",
        class: ModeModule,
        args: [
          "Transport",
          "transport-module",
          "html/transportModule.html", // Updated path
          document.getElementById("cp-bottom-row")
        ]
      },
      {
        name: "playParameters",
        class: PlayParametersModule,
        args: [
          "Play Parameters",
          "play-parameters-module",
          "html/playParametersModule.html", // Updated path
          document.getElementById("cp-bottom-row")
        ]
      },
      {
        name: "disk",
        class: DiskModule,
        args: [
          "Disk",
          "disk-module",
          "html/diskModule.html", // Updated path
          document.getElementById("cp-top-row")
        ]
      }
    ];
    console.log(`[${new Date().toISOString()}] Starting module initialization`);
    this.initializeModules();
    this.ac = new AudioContext();
  }

  async initializeModules() {
    for (const { name, class: Module, args } of this.initializationOrder) {
      const module = new Module(this, ...args);
      await module.initializeWithHtml(); // Ensure the module is fully initialized before moving on
      this.modules[name] = module; // Store the initialized module
    }
    console.log(`[${new Date().toISOString()}] All modules instantiated and initialized`);
  }

  getModule(name) {
    return this.modules[name];
  }
}

const app = new App();