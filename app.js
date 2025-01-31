class App {
  constructor() {
    this.lc = new LoadingCover();
          this.modules = {}; // Store module instances here
    this.initializationOrder = [
         {
        name: "title",
        class: TitleModule,
        args: [
          "About",
          "title-module",
          "html/titleModule.html", // Updated path
          document.getElementById("cp-top-row")
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
        name: "mode",
        class: ModeModule,
        args: [
          "Mode",
          "mode-module",
          "html/modeModule.html", // Updated path
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
        name: "transport",
        class: TransportModule,
        args: [
          "Transport",
          "transport-module",
          "html/transportModule.html", // Updated path
          document.getElementById("cp-bottom-row")
        ]
      },
           {
        name: "mixer",
        class: MixerModule,
        args: [
          "Mixer",
          "mixer-module",
          "html/mixerModule.html", // Updated path
          document.getElementById("cp-bottom-row")
        ]
      },
      {
        name: "projectManager",
        class: ProjectManagerModule,
        args: [
          "Project Manager",
          "project-manager-module",
          "html/projectManagerModule.html", // Updated path
          document.getElementById("cp-top-row")
        ]
      }
    ];
    console.log(`[${new Date().toISOString()}] Starting module initialization`);
    this.initializeModules();
    this.ac = new AudioContext();
  }

  async initializeModules() {
          this.lc.show("Loading Modules, please wait...");
          for (const { name, class: Module, args } of this.initializationOrder) {
      const module = new Module(this, ...args);
      await module.initializeWithHtml(); // Ensure the module is fully initialized before moving on
      this.modules[name] = module; // Store the initialized module
    }
    console.log(`[${new Date().toISOString()}] All modules instantiated and initialized`);
    this.lc.hide();
          const bt = this.getModule("beatTrack");
          const gv = this.getModule("gridView");
          gv.generateGrid();
          const wfv = this.getModule("waveFormView");
          wfv.updateWaveForm();
          const fm =this.getModule("projectManager");
          fm.loadAutosave();
          const mm = this.getModule("mode");
          mm.mode = MODE_WRITE;
  }

  getModule(name) {
    return this.modules[name];
  }
}

const app = new App();