const MODE_WRITE = 0;
const MODE_ARRANGE = 1;
const MODE_PLAY = 2;

class App {
        constructor() {
                this.lc = new LoadingCover();
                this.modules = {};
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
    this.ac = new AudioContext();  // Keep this early if need
         this.consoleToDiv = new ConsoleToDiv();
    this.initializeApp();
  }

  async initializeApp() {
    try {
      console.log(`[${new Date().toISOString()}] Starting module initialization`);
      await this.initializeModules();
      await this.postInitializationSetup();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Critical initialization error:` + error);
      this.lc.show("Initialization failed - please refresh");
    }
  }
        
        async initializeModules() {
                this.lc.show("Loading Modules, please wait...");
                // Initialize modules sequentially to maintain order
                for (const { name, class: Module, args } of this.initializationOrder) {
                        try {
        const module = new Module(this, ...args);
        await module.initialize(); // Use full initialization flow
        this.modules[name] = module;
        console.log(`[${new Date().toISOString()}] ${name} module initialized`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to initialize ${name}:`, error);
        throw error; // Rethrow to stop initialization
      }
    }
    
    this.lc.hide();
  }

  async postInitializationSetup() {
    // Wait for all modules to settle
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Access modules through safe getter
    const pm = this.getModule("projectManager");
    const gv = this.getModule("gridView");
    const mm = this.getModule("mode");
    const bt = this.getModule("beatTrack");
          const pp = this.getModule("playParameters");
    // Ensure safe access pattern
    if (!pm || !gv || !mm || !bt) {
      throw new Error("Critical modules missing");
    }

  
          console.log("generating Grid");
          gv.generateGrid();
          pm.loadAutosave();
    }
            
 
  getModule(name) {
    const module = this.modules[name];
    if (!module) {
      console.warn(`Module ${name} not found`);
    }
    return module;
  }
}

// Startup pattern
const app = new App(); // Let constructor handle async initialization