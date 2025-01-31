class WaveFormViewModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);

    // Properties
    this.waveFormViewDisplay = null;
    this.waveformCanvas = null;
    this.regionCanvas = null;
    this.waveformCtx = null;
    this.regionCtx = null;
    this.audioDurationInSeconds = 0;
    this.waveFormDrawn = false;

    this.cursorCanvas = null; // New canvas for the cursor
    this.cursorCtx = null; // Context for the cursor canvas
    
    this.ac = app.ac; // Use AudioContext from the app instance
  }

  setupDOM() {
    super.setupDOM();

    this.waveFormViewDisplay = this.moduleContent.querySelector("#wave-form-view-display");
    if (!this.waveFormViewDisplay) {
      console.warn("Waveform view display not found.");
      return;
   }
    

    // Create and append canvases
    this.waveformCanvas = document.createElement("canvas");
    this.waveformCanvas.id = "wave-form-canvas";

    this.regionCanvas = document.createElement("canvas");
    this.regionCanvas.id = "region-canvas";

    this.cursorCanvas = document.createElement("canvas");
    this.cursorCanvas.id = "cursor-canvas";

    this.waveFormViewDisplay.appendChild(this.waveformCanvas);
    this.waveFormViewDisplay.appendChild(this.regionCanvas);
    this.waveFormViewDisplay.appendChild(this.cursorCanvas);

    // Get 2D contexts
    this.waveformCtx = this.waveformCanvas.getContext("2d");
    this.regionCtx = this.regionCanvas.getContext("2d");
    this.cursorCtx = this.cursorCanvas.getContext("2d");
  }
  
  async updateWaveForm() {
    this.app.lc.show("loading waveform, please wait...");
    const audioFileUrl = this.app.getModule("beatTrack").beatTrackUrl;
    if (!audioFileUrl || !this.ac) {
      console.error("Audio file URL or AudioContext is missing.");
      return;
    }

    const canvasWidth = this.waveformCanvas.width;
    const canvasHeight = this.waveformCanvas.height;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", audioFileUrl, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = () => {
      if (xhr.status === 200) {
        this.ac.decodeAudioData(
          xhr.response,
          (decodedData) => {
            this.audioDurationInSeconds = decodedData.duration;

            const data = decodedData.getChannelData(0);
            const step = Math.ceil(data.length / (canvasWidth * 16));
            const amp = canvasHeight / 2;

            this.waveformCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            this.waveformCtx.lineWidth = 0.75;
            this.waveformCtx.strokeStyle = "green";

            this.waveformCtx.beginPath();
            let x = 0;
            for (let i = 0; i < canvasWidth; i++) {
              let min = 1.0;
              let max = -1.0;
              for (let j = 0; j < step; j++) {
                const datum = data[i * step + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
              }
              this.waveformCtx.moveTo(x, (1 + min) * amp);
              this.waveformCtx.lineTo(x, (1 + max) * amp);
              x += 1;
            }
            this.waveformCtx.stroke();
            this.waveFormDrawn = true;
            this.updateMarkers();
            this.app.lc.hide();
          },
          (error) => console.error("Error decoding audio data:", error)
        );
      } else {
        console.error("Failed to fetch audio file, status:", xhr.status);
      }
    };

    xhr.onerror = () => console.error("Network error while fetching audio file.");
    xhr.send();
  }

  updateMarkers() {
    const bpm = this.app.getModule("playParameters").BPM;
    const offsetBars = this.app.getModule("beatTrack").offsetBars;
    const start = this.app.getModule("gridView").startMarkerPosition;
    const end = this.app.getModule("gridView").endMarkerPosition;

    if (!this.audioDurationInSeconds || !bpm || !this.waveFormDrawn) {
        console.log("Skipping updateMarkers: Missing required data.");
        return;
    }

    const canvasWidth = this.regionCanvas.width;
    const secondsPerBar = 240 / bpm;
    const totalBars = this.audioDurationInSeconds / secondsPerBar;
    const barsToDisplay = 18;
    const totalRegionWidth = canvasWidth * (barsToDisplay / totalBars);
    const startPositionInSeconds = offsetBars * secondsPerBar;
    const xOffset = (startPositionInSeconds / this.audioDurationInSeconds) * canvasWidth;

    const xStart = xOffset + (start / barsToDisplay) * totalRegionWidth;
    const xEnd = xOffset + ((end + 1) / barsToDisplay) * totalRegionWidth;

    console.log("Canvas Width:", canvasWidth);
    console.log("Seconds per Bar:", secondsPerBar);
    console.log("Total Bars:", totalBars);
    console.log("Bars to Display:", barsToDisplay);
    console.log("Total Region Width:", totalRegionWidth);
    console.log("Start Position in Seconds:", startPositionInSeconds);
    console.log("X Offset:", xOffset);
    console.log("X Start:", xStart);
    console.log("X End:", xEnd);

    this.regionCtx.clearRect(0, 0, canvasWidth, this.regionCanvas.height);
    this.regionCtx.fillStyle = "rgba(255, 255, 0, 0.5)";
    this.regionCtx.fillRect(xOffset, 0, totalRegionWidth, this.regionCanvas.height);

    this.regionCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.regionCtx.fillRect(xStart, 0, xEnd - xStart, this.regionCanvas.height);

    console.log("Drawing completed.");
}
}