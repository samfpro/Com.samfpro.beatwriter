const MUTE_STATE_AUTO = 1;
const MUTE_STATE_MANUAL = 2;
const MUTE_STATE_OFF = 0;
const MUTE_STATE_SOLO = 3;

class Channel {
  constructor(mixer, channelContainer, slider, muteButton, soloButton, meter, transport, channelIndex) {
    this.channelContainer = channelContainer;
    this.mixer = mixer;
    this.slider = slider;
    this.muteButton = muteButton;
    this.soloButton = soloButton;
    this.meter = meter;
    this.transport = transport;
    this.channelIndex = channelIndex;
    this.startY = null;
    this.direction = null;
    this.startValue = null;
    this.sensitivity = 40;
    this.analyzer = transport.analyzers[channelIndex]; // Reference to transport's analyzer
 
    // Default properties
    this._muteState = MUTE_STATE_OFF; // off, manual, auto, solo
    this.previousVolume = parseFloat(this.slider.value);
    
    // Set up event listeners
    this.slider.addEventListener("input", () => this.updateVolume());
    this.slider.addEventListener("touchmove", (event) => this.handleTouchMove(event));
    this.slider.addEventListener("touchstart", (event) => this.handleTouchStart(event));
    this.slider.addEventListener("touchend", (event) => this.handleTouchEnd(event));
    if (this.muteButton){
    this.muteButton.addEventListener("click", () => this.toggleMute());
    this.soloButton.addEventListener("click", () => this.toggleSolo());
    }
    this.setupMeter();
    this.startMeterAnimation();
  }
  
  setupMeter(){
     for(let i=0; i < 7; i++){
       const indicator = document.createElement("div");
       indicator.id = "meter-indicator-light-" + (i+1);
       indicator.classList.add("meter-indicator-light", "mil-green");
       this.meter.appendChild(indicator);
       
     }
    for(let i=7; i < 9; i++){
       const indicator = document.createElement("div");
       indicator.id = "meter-indicator-light-" + (i+1);
       indicator.classList.add("meter-indicator-light", "mil-orange");
       this.meter.appendChild(indicator);
     }
    const indicator = document.createElement("div");
       indicator.id = "meter-indicator-light-" + 10;
       indicator.classList.add("meter-indicator-light", "mil-red");
       this.meter.appendChild(indicator);
    
    
  }
  startMeterAnimation() {
  const bufferLength = this.analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const lights = Array.from(this.meter.querySelectorAll(".meter-indicator-light"));

  const animate = () => {
    if (!this.isAnimating) return; // Stop animation if flag is false

    this.analyzer.getByteFrequencyData(dataArray);
    const level = Math.max(...dataArray); // Get peak value

    lights.forEach((light, index) => {
      light.style.opacity = level > index * (255 / lights.length) ? "1" : "0.2";
    });

    requestAnimationFrame(animate);
  };

  this.isAnimating = true; // Set flag to true when animation starts
  animate();
}
  stopMeterAnimation() {
  this.isAnimating = false; // Set flag to false to stop animation
}
  updateVolume(){
    if(this.muteState == MUTE_STATE_SOLO || this.muteState == MUTE_STATE_OFF){
      this.transport.setGainForChannel(this.channelIndex, this.slider.value);
    }
  }
  muteGain(){
    this.transport.setGainForChannel(this.channelIndex, 0);
  }

  // Toggle mute based on current mute
  toggleMute() {
    if (this.muteState === MUTE_STATE_OFF) {
      this.muteState = MUTE_STATE_MANUAL;
    } else if (this.muteState === MUTE_STATE_MANUAL) {
      this.muteState = MUTE_STATE_OFF;
    } 
  }
  
  toggleSolo() {
  if (this.muteState === MUTE_STATE_SOLO) {
    // Turn off SOLO and adjust other channels
    const autoMute = this.mixer.setAutoMutes(false, this.channelIndex);
    this.muteState = autoMute ? MUTE_STATE_AUTO : MUTE_STATE_OFF;
  } else {
    // Turn on SOLO and set other channels to AUTO mute
    this.muteState = MUTE_STATE_SOLO;
    this.mixer.setAutoMutes(true, this.channelIndex);
  }
}
  
   get muteState(){
       return this._muteState;
   }
  // Set mute state and handle interactions
  set muteState(value){
    const previousState = this._muteState;
    this._muteState = value;
    
    if (value === MUTE_STATE_SOLO){
      this.muteButton.classList.remove("active");
      this.soloButton.classList.add("active");
      this.updateVolume();
    } else if (value === MUTE_STATE_MANUAL) {
      this.soloButton.classList.remove("active");
      this.muteButton.classList.add("active");
      this.muteGain();
    } else if (value === MUTE_STATE_OFF) {
      this.soloButton.classList.remove("active");
      this.muteButton.classList.remove("active");
      this.updateVolume();
    } else if (value === MUTE_STATE_AUTO) {
      this.soloButton.classList.remove("active");
      this.muteButton.classList.add("active");
      this.muteGain();
    }
  }

  // Handle touch events for fine-grained volume control
  handleTouchStart(event) {
    const target = event.target;
    if (target && target.tagName === "INPUT" && target.type === "range") {
      this.startY = event.touches[0].clientY;
      this.startValue = parseFloat(target.value);
      this.direction = 0;
    }
  }

  handleTouchMove(event) {
    if (this.slider) {
      event.preventDefault();
      event.stopPropagation();

      const currentY = event.touches[0].clientY;
      const deltaY = this.startY - currentY;
      const step = deltaY / this.sensitivity;

      if (deltaY > 0) this.direction = 1;
      else if (deltaY < 0) this.direction = -1;

      let newValue = Math.max(
        Math.min(this.startValue + step, parseFloat(this.slider.max)),
        parseFloat(this.slider.min)
      );

      newValue = Math.max(0, Math.min(newValue, 1));
      this.slider.value = newValue;
      this.slider.dispatchEvent(new Event("input"));
    }
  }

  handleTouchEnd() {
    this.direction = 0;
  }
  
  

}

class MixerModule extends Module {
  constructor(app, titleText, styleName, htmlFile, parentElement) {
    super(app, titleText, styleName, htmlFile, parentElement);

    this.channels = [];
    this.transport = this.app.getModule("transport");
  }

  setupDOM() {
    super.setupDOM();

    const container = this.moduleContent;
    if (!container) {
      console.error("moduleContent is not defined. Event listeners cannot be attached.");
      return;
    }

    const channelContainers = container.querySelectorAll(".channel-container");
    channelContainers.forEach((channelContainer, index) => {
      const slider = channelContainer.querySelector(`.slider`);
      const muteButton = channelContainer.querySelector(`#mute-ch-${index + 1}`);
      const soloButton = channelContainer.querySelector(`#solo-ch-${index + 1}`);
      const meter = channelContainer.querySelector(`#meter-ch-${index + 1}`);

      const channel = new Channel(this, channelContainer, slider, muteButton, soloButton, meter, this.transport, index);
      this.channels.push(channel);
    });
  }
startPlayback() {
  this.channels.forEach((channel) => channel.startMeterAnimation());
  this.transport.startPlayback(); // Assuming transport handles playback
}

stopPlayback() {
  this.channels.forEach((channel) => channel.stopMeterAnimation());
  this.transport.stopPlayback(); // Assuming transport handles stopping playback
}@
  
   // Handle solo state logic
  // Handle solo state logic
setAutoMutes(mute, index) {
  console.log("setting auto mutes");

  if (!this.channels || !Array.isArray(this.channels)) {
    console.error("Channels array is missing or invalid");
    return false;
  }

  if (mute === true) {
    // Set other channels to AUTO mute if their state is OFF
    this.channels.forEach((channel) => {
      // Skip channel 4
      if (
        channel.channelIndex !== index && 
        channel.channelIndex !== 3 && // Exclude channel 4 (zero-based index)
        channel.muteState === MUTE_STATE_OFF
      ) {
        channel.muteState = MUTE_STATE_AUTO;
        console.log(`Channel ${channel.channelIndex} set to MUTE_STATE_AUTO`);
      }
    });
    return true;
  } else if (mute === false) {
    // Check for other active SOLO channels
    const otherSolosActive = this.channels.some(
      (channel) => channel.channelIndex !== index && channel.muteState === MUTE_STATE_SOLO
    );

    if (otherSolosActive) {
      console.log("Other SOLO channels are active. Keeping AUTO mutes.");
      return true;
    } else {
      console.log("No other SOLO channels active. Turning off AUTO mutes.");
      this.channels.forEach((channel) => {
        if (channel.muteState === MUTE_STATE_AUTO) {
          channel.muteState = MUTE_STATE_OFF;
          console.log(`Channel ${channel.channelIndex} set to MUTE_STATE_OFF`);
        }
      });
      return false;
    }
  }

  return false; // Default return for unexpected input
}
}
  