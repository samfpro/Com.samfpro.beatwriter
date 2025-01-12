class TransportModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);
    this.playButton = null;
    this.pauseButton = null;
    this.stopButton = null;
    this.app = app;
    this.ac = app.ac;
    this.sineNodes = Array.from({ length: 256 }, () => null);
    this.sawNodes = Array.from({ length: 256 }, () => null);
    this.ttsNodes = Array.from({ length: 256 }, () => null);
    this.beatTrackBuffer = null;
    this.ttsCache = new Map();
    this.metronomeTickDuration = 0.05; // Just enough for that tick sound.
    this.sineGain = null;
    this.sawGain = null;
    this.ttsGain = null;
    this.beatTrackGain = null;
    this.masterGain = null;
    this.metronomeGain = null;
    this.recording = false;
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.scheduledNodes = []; // Array to keep track of scheduled nodes
    this.cursorTimeouts = []; // Array to keep track of cursor update timeouts
    this.analyzers = []; // Array to store AnalyserNodes
    this.gains = []; // Array to store channel gains
  }
  
  setupDOM() {
    super.setupDOM();
    // Get DOM elements
      console.log("Transport setting up dom");
      this.playButton = this.moduleContent.querySelector("#play-button");
      this.pauseButton = this.moduleContent.querySelector("#pause-button");
      this.stopButton = this.moduleContent.querySelector("#stop-button");
      this.playButton.addEventListener("click", () => {
        this.start();
      });
      this.stopButton.addEventListener("click", () => {
        this.stopSequencer();
      })
      this.buildAudioGraph();
  }
    
    
    

  async start() {
  console.log("starting playback");
  this.playButton.classList.add("active");
  let mode = this.app.getModule("disk").mode;
  this.previousMode = mode;
  mode = MODE_PLAY;

  await this.resumeAudioContext();

  // Ensure the beat track buffer is ready before scheduling playback
  try {
    const beatTrackNode = await this.createBeatTrack(); // Ensure buffer is loaded
    await this.schedulePlayback(beatTrackNode); // Pass the node to schedulePlayback
  } catch (error) {
    console.error("Error starting playback:", error);
    alert("Failed to start playback. Please try again.");
  }
}


  async resumeAudioContext() {
    if (this.ac.state === "suspended") {
      await this.ac.resume();
      console.log("AudioContext resumed.");
    }
  }

  async buildAudioGraph() {
    console.log("creating gains");

    this.metronomeGain = this.ac.createGain();
    this.sineGain = this.ac.createGain();
    this.sawGain = this.ac.createGain();
    this.ttsGain = this.ac.createGain();
    this.beatTrackGain = this.ac.createGain();
    this.masterGain = this.ac.createGain();
    console.log(this.ac);

    console.log("connecting graph");

    this.sineGain.connect(this.metronomeGain);
    this.sawGain.connect(this.metronomeGain);
    this.metronomeGain.connect(this.masterGain);
    this.ttsGain.connect(this.masterGain);
    this.beatTrackGain.connect(this.masterGain);
    this.masterGain.connect(this.ac.destination);

    this.metronomeGain.gain.setValueAtTime(0.5, this.ac.currentTime);
    this.ttsGain.gain.setValueAtTime(1, this.ac.currentTime);
    this.beatTrackGain.gain.setValueAtTime(0.5, this.ac.currentTime);
    this.masterGain.gain.setValueAtTime(1, this.ac.currentTime);
    this.gains.push(this.beatTrackGain);
    this.gains.push(this.ttsGain);
    this.gains.push(this.metronomeGain);
    this.gains.push(this.masterGain);
    for (let i = 0; i < 4; i++) {
      const gain = this.gains[i];
      const analyzer = this.ac.createAnalyser();
      
      gain.connect(analyzer); // Connect gain to analyzer
     // analyzer.connect(this.masterGain); // Connect analyzer to the master output

      
      this.analyzers.push(analyzer);
      
      // Optional: Set analyzer properties for better visualization
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.85;
    }

    // Connect master gain to destination
    this.masterGain.connect(this.ac.destination);
    this.masterGain.gain.setValueAtTime(.8, this.ac.currentTime);
  }
  
  
 async schedulePlayback(beatTrackNode) {
  console.log("scheduling playback");

  const diskModule = this.app.getModule("disk");
  const leadInMS = diskModule.beatTrackParameterValues[0].currentValue;
  const leadInBars = diskModule.beatTrackParameterValues[1].currentValue;
  const bpm = diskModule.playParameterValues[0].currentValue;
  const cells = this.app.getModule("gridView").cells;
  const startPos = diskModule.startMarkerPosition * 16;
  const endPos = (diskModule.endMarkerPosition * 16) + 16;
  const stepsToPlay = endPos - startPos;

  console.log("The number of steps to play is: " + stepsToPlay);

  this.stepDuration = 60 / (bpm * 4);
  this.playbackDuration = stepsToPlay * this.stepDuration;

  const startTime = this.ac.currentTime + (4 * this.stepDuration); // Ensure proper lead-in time
  const endTime = startTime + this.playbackDuration;

  this.hideCursor(endPos, endTime);

  let beatTrackOffsetS = 0;
  if (startPos !== 0 || leadInBars !== 0) {
    beatTrackOffsetS = (startPos + (leadInBars * 16)) * this.stepDuration;
  }
  
  if (leadInMS.currentValue !== 0) {
    beatTrackOffsetS += leadInMS / 1000;
  }

  const beatTrackStartTime = startTime;

  // Schedule Beat Track Playback
  await this.scheduleBeatTrack(beatTrackNode, beatTrackStartTime, beatTrackOffsetS);

  // Schedule Steps Playback
  for (let step = startPos; step <= endPos; step++) {
    const time = startTime + (step - startPos) * this.stepDuration;

    if (step >= 0 && step < cells.length) {
      if ((step + 2) % 2 === 0) {
        this.scheduleOsc(this.sineNodes[step], "sine", this.sineGain, time);
      }
      if ((step + 4) % 8 === 0) {
        this.scheduleOsc(this.sawNodes[step], "saw", this.sawGain, time);
      }

      if (cells[step].syllable !== "") {
        this.scheduleTts(time, cells[step].syllable);
      }

      this.showCursor(step, time);
    } else {
      console.error("Attempted to access step out of bounds: " + step);
    }
  }

  // Schedule stopSequencer to execute at endTime
  setTimeout(() => {
    this.stopSequencer();
  }, (endTime - this.ac.currentTime) * 1000);
}

async stopSequencer() {
  console.log("Stopping sequencer...");

  // Stop all scheduled nodes
  this.scheduledNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) {
      console.error("Error stopping node: " + e);
    }
  });
  this.scheduledNodes = []; // Clear the array

  // Clear cursor timeouts
  this.cursorTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  this.cursorTimeouts = []; // Clear the array
  const cells = this.app.getModule("gridView").cells;
  cells.forEach(cell => {
    cell.stepPlaying = false;
  });
  this.playButton.classList.remove("active");
}

  async scheduleOsc(node, type, gainNode, time) {
    node = this.ac.createOscillator();
    node.type = type;
    node.frequency.setValueAtTime(335, this.ac.currentTime);

    node.connect(gainNode);

    node.start(time);
    node.stop(time + this.metronomeTickDuration);

    this.scheduledNodes.push(node); // Keep track of the node
    console.log(`Scheduled ${type} oscillator at ${time}s.`);
  }

async createBeatTrack() {
  const diskModule = this.app.getModule("disk");
  
  return new Promise((resolve, reject) => {
    console.log("creating beatTrackNode");

    // If buffer already exists, create and return node immediately
    if (this.beatTrackBuffer != null) {
      const beatTrackNode = this.ac.createBufferSource();
      beatTrackNode.buffer = this.beatTrackBuffer;
      beatTrackNode.connect(this.beatTrackGain);
      return resolve(beatTrackNode);
    }

    // If buffer doesn't exist, load it
    const request = new XMLHttpRequest();
    request.open("GET", diskModule.beatTrackUrl, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        this.ac.decodeAudioData(
          request.response,
          (buffer) => {
            console.log("Audio data decoded successfully.");
            this.beatTrackBuffer = buffer;

            const beatTrackNode = this.ac.createBufferSource();
            beatTrackNode.buffer = buffer;
            beatTrackNode.connect(this.beatTrackGain);
            resolve(beatTrackNode);
          },
          (decodeError) => {
            console.error("Error decoding audio data:", decodeError);
            reject(decodeError);
          }
        );
      } else {
        console.error("Failed to fetch audio data. Status:", request.status);
        reject(new Error(`Failed to load beat track: ${request.status}`));
      }
    };

    request.onerror = () => {
      console.error("Network error while fetching audio data.");
      reject(new Error("Network error loading beat track"));
    };

    request.send();
  });
}




  
  async scheduleBeatTrack(node, time, offset) {
    console.log("scheduling....and the node is " + node + "and the time is " + time + "and the offset is " + offset);
    node.start(time, offset);
    node.stop(time + this.playbackDuration, offset);
    this.scheduledNodes.push(node); // Keep track of the node
    console.log("scheduled beatTrack start at " + time + " with offset: " + offset);
  }

  async scheduleTts(time, textToConvert) {
    const diskModule = this.app.getModule("disk");
    const ttsVoice = diskModule.playParameterValues[1].currentValue;
    const ttsRate = diskModule.playParameterValues[2].currentValue;
    console.log(`Scheduling TTS for "${textToConvert}" at ${time}s...`);
    try {
      const trimmedText = textToConvert.trim();
      if (trimmedText != "") {
        // Check if the voice has changed
        if (ttsVoice !== this.currentTtsVoice) {
          console.log('TTS voice has changed. Clearing cache.');
          this.ttsCache.clear();
          this.currentTtsVoice = ttsVoice;
        }

        const cachedBuffer = this.ttsCache.get(trimmedText);
        if (cachedBuffer) {
          console.log('TTS found in cache.');
          await this.playCachedTts(time, cachedBuffer);
        } else {
          console.log('TTS not found in cache. Requesting TTS conversion...');
          const audioBlob = await textToAudioBlob(trimmedText, ttsRate, ttsVoice);
          const ttsArrayBuffer = await audioBlob.arrayBuffer();
          this.ac.decodeAudioData(ttsArrayBuffer, (buffer) => {
            console.log('Decoding successful. Caching TTS data...');
            this.ttsCache.set(trimmedText, buffer);
            this.playCachedTts(time, buffer);
          });
        }
      } else {
        console.log('Skipping TTS scheduling for a blank syllable.');
      }
    } catch (error) {
      console.error('Error in scheduleTTS:' + error);
    }
    console.log('TTS scheduled.');
  }

  async playCachedTts(time, buffer) {
    let ttsSource = this.ac.createBufferSource();
    ttsSource.buffer = buffer;
    console.log("set the ttsSource");
    ttsSource.connect(this.ttsGain);
    ttsSource.start(time);
    ttsSource.stop(time + (this.stepDuration * 4));
    this.scheduledNodes.push(ttsSource); // Keep track of the node
    console.log(`Scheduled TTS playback at ${time}s.`);
  }

  async showCursor(step, time) {
    const cells = this.app.getModule("gridView").cells;
    console.log("attempting showCursor");
    const timeoutId = setTimeout(() => {
      cells[step].stepPlaying = true;

      if (step > 0) {
        cells[step - 1].stepPlaying = false;
      }
    }, (time - this.ac.currentTime) * 1000);
    this.cursorTimeouts.push(timeoutId); // Keep track of the timeout
  }

  async hideCursor(step, time) {
    const cells = this.app.getModule("gridView").cells;
    console.log("attempting hideCursor");
    const timeoutId = setTimeout(() => {
      cells[step].stepPlaying = false;

      console.log(step + ' step cursor off');
    }, (time - this.ac.currentTime) * 1000);
    this.cursorTimeouts.push(timeoutId); // Keep track of the timeout
  } // Adjusted timeout based on sequencer time

  // Add a method to update channel gains
  setGainForChannel(channelIndex, gainValue) {
    switch (channelIndex) {
      case 0: // Sine Channel
        this.beatTrackGain.gain.setValueAtTime(gainValue, this.ac.currentTime);
        break;
      case 1: // Saw Channel
        this.ttsGain.gain.setValueAtTime(gainValue, this.ac.currentTime);
   
     break;
      case 2: // TTS Channel
             this.sawGain.gain.setValueAtTime(gainValue, this.ac.currentTime);
        this.sineGain.gain.setValueAtTime(gainValue, this.ac.currentTime);
   
        break;
      case 3: // BeatTrack Channel
            this.masterGain.gain.setValueAtTime(gainValue, this.ac.currentTime);
   
               break;
      default:
        console.warn(`Unknown channel index: ${channelIndex}`);
        break;
    }
  }
}


// Example usage:
// modePlay.start();
// modePlay.stopSequencer();
  
