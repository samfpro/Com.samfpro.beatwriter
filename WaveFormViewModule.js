class WaveFormViewModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.waveFormViewDisplay = null;
    this.waveformCanvas = null;
    this.regionCanvas = null;
    this.waveformCtx = null;
    this.regionCtx = null;
    this.audioFile = null;
    this.audioDurationInSeconds = 25;
    this.waveFormDrawn = false;
    
    this.cursorCanvas = null; // New canvas for the cursor
    this.cursorCtx = null; // Context for the cursor canvas


    // Use AudioContext from the app instance
    this.ac = app.ac;
  }

  setupDOM() {
    super.setupDOM();

    // Query and validate the DOM element for the waveform view display
    this.waveFormViewDisplay = this.moduleContent.querySelector("#wave-form-view-display");
    if (!this.waveFormViewDisplay) {
      console.warn("Waveform view display not found.");
      return;
    }

    // Create canvas elements dynamically
    this.waveformCanvas = document.createElement("canvas");
    this.waveformCanvas.id = "wave-form-canvas";

    this.regionCanvas = document.createElement("canvas");
    this.regionCanvas.id = "region-canvas";

    this.cursorCanvas = document.createElement("canvas"); // Add cursor canvas
    this.cursorCanvas.id = "cursor-canvas";
    
    // Append canvases to the waveFormViewDisplay
    this.waveFormViewDisplay.appendChild(this.waveformCanvas);
    this.waveFormViewDisplay.appendChild(this.regionCanvas);
    this.waveFormViewDisplay.appendChild(this.cursorCanvas); // Append cursor canvas
    // Get 2D contexts for both canvases
    this.waveformCtx = this.waveformCanvas.getContext("2d");
    this.regionCtx = this.regionCanvas.getContext("2d");
    this.cursorCtx = this.cursorCanvas.getContext("2d"); // Context for cursor

  }

  async updateWaveForm(audioFileUrl, start, end, bpm, leadIn) {
    console.log("updateWaveform() called.");

    this.audioFileUrl = audioFileUrl;
    console.log("audioFileUrl: " + audioFileUrl);

    if (!this.audioFileUrl || !this.ac) {
      console.error("Audio file or AudioContext is missing.");
      return;
    }

    const canvasWidth = this.waveformCanvas.width;
    const canvasHeight = this.waveformCanvas.height;

    // Fetch and decode the audio file
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.audioFileUrl, true);
    xhr.responseType = "arraybuffer";

    xhr.onload = () => {
      if (xhr.status === 200) {
        this.ac.decodeAudioData(
          xhr.response,
          (decodedData) => {
            console.log(decodedData);
            this.audioDurationInSeconds = decodedData.duration;
            console.log("audioDuration: " + this.audioDurationInSeconds);
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
            console.log("markerParams: " + start + end + bpm + leadIn);
            this.updateMarkers(start, end, bpm, leadIn);
          },
          (error) => {
            console.error("Error decoding audio data:", error);
          }
        );
      } else {
        console.error("Failed to fetch audio file, status:", xhr.status);
      }
    };

    xhr.onerror = () => {
      console.error("Network error while fetching audio file.");
    };

    xhr.send();
  }

  updateMarkers(startPoint, endPoint, bpm, leadInBars) {
    console.log("updateMarkers() called.");

    if (!this.audioDurationInSeconds) {
      console.error("Audio duration is missing.");
      return;
    }else if (!bpm) {
      console.error("BPM is missing.");
      return;
    }else if (!this.waveFormDrawn){
      console.log("awaiting waveform");
      return;
    }

    const canvasWidth = this.regionCanvas.width;
    const secondsPerBar = 240 / bpm;
    const totalBars = this.audioDurationInSeconds / secondsPerBar;
    const barsToDisplay = 18;
    const totalRegionWidth = canvasWidth * (barsToDisplay / totalBars);

    const startPositionInSeconds = leadInBars * secondsPerBar;
    const startPositionPercentage = (startPositionInSeconds / this.audioDurationInSeconds) * 100;
    const xOffset = (startPositionPercentage / 100) * canvasWidth;

    const xStart = xOffset + (startPoint / barsToDisplay) * totalRegionWidth;
    const xEnd = xOffset + ((endPoint + 1) / barsToDisplay) * totalRegionWidth;

    this.regionCtx.clearRect(0, 0, canvasWidth, this.regionCanvas.height);

    // Draw yellow background
    this.regionCtx.fillStyle = "rgba(255, 255, 0, 0.5)";
    this.regionCtx.fillRect(xOffset, 0, totalRegionWidth, this.regionCanvas.height);

    // Draw white region
    this.regionCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.regionCtx.fillRect(xStart, 0, xEnd - xStart, this.regionCanvas.height);
  }
  showPlaybackCursor() {
    
  }

}