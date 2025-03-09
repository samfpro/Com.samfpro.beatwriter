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
    this.animationFrameId = null; // Track animation frame for stopping
    // Default properties
    this.muteState = MUTE_STATE_OFF;
    this.previousVolume = parseFloat(this.slider.value);

    // Set up event listeners
    this.slider.addEventListener("input", () => this.updateVolume());
    this.slider.addEventListener("touchmove", (event) => this.handleTouchMove(event));
    this.slider.addEventListener("touchstart", (event) => this.handleTouchStart(event));
    this.slider.addEventListener("touchend", (event) => this.handleTouchEnd(event));

    if (this.muteButton && this.soloButton) {
      console.log(`Channel ${this.channelIndex}: Mute and Solo buttons found.`);
      this.muteButton.addEventListener("click", () => this.toggleMute());
      this.soloButton.addEventListener("click", () => this.toggleSolo());
    } else {
      console.warn(`Channel ${this.channelIndex}: No Mute/Solo buttons (likely master channel).`);
    }

    this.setupMeter();
    this.animateMeter(); // Start meter animation
  }
handleTouchStart(event) {
  event.preventDefault(); // Prevent page scrolling
  event.stopPropagation(); // Stop event from bubbling up

  this.startY = event.touches[0].clientY;
  this.startValue = parseFloat(this.slider.value);
}

handleTouchMove(event) {
  event.preventDefault(); // Prevent page scrolling
  event.stopPropagation(); // Stop event from bubbling up

  const touchY = event.touches[0].clientY;
  const deltaY = this.startY - touchY;
  const newValue = Math.max(0, Math.min(1, this.startValue + deltaY / this.sensitivity));

  this.slider.value = newValue;
  this.updateVolume();
}

handleTouchEnd(event) {
  event.preventDefault(); // Prevent page scrolling
  event.stopPropagation(); // Stop event from bubbling up
}
  setupMeter() {
    this.meterIndicators = [];
    for (let i = 0; i < 7; i++) {
      const indicator = document.createElement("div");
      indicator.id = `meter-indicator-light-${i + 1}`;
      indicator.classList.add("meter-indicator-light", "mil-green");
      this.meter.appendChild(indicator);
      this.meterIndicators.push(indicator);
    }
    for (let i = 7; i < 9; i++) {
      const indicator = document.createElement("div");
      indicator.id = `meter-indicator-light-${i + 1}`;
      indicator.classList.add("meter-indicator-light", "mil-orange");
      this.meter.appendChild(indicator);
      this.meterIndicators.push(indicator);
    }
    const indicator = document.createElement("div");
    indicator.id = "meter-indicator-light-10";
    indicator.classList.add("meter-indicator-light", "mil-red");
    this.meter.appendChild(indicator);
    this.meterIndicators.push(indicator);
  }

  animateMeter() {
    if (!this.analyzer) return;
    
    const updateMeter = () => {
      const level = this.analyzer.getLevel();
      const activeLights = Math.round(level * this.meterIndicators.length);

      this.meterIndicators.forEach((indicator, index) => {
        indicator.classList.toggle("active", index < activeLights);
      });

      this.animationFrameId = requestAnimationFrame(updateMeter);
    };

    this.animationFrameId = requestAnimationFrame(updateMeter);
  }

  stopMeterAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      
      // Clear the meter indicators
      this.meterIndicators.forEach(indicator => indicator.classList.remove("active"));
    }
  }

  updateVolume() {
    if (this.muteState === MUTE_STATE_SOLO || this.muteState === MUTE_STATE_OFF) {
      console.log(`Channel ${this.channelIndex}: Volume updated to ${this.slider.value}`);
      this.transport.setGainForChannel(this.channelIndex, this.slider.value);
    }
  }

  muteGain() {
    console.log(`Channel ${this.channelIndex}: Muted`);
    this.transport.setGainForChannel(this.channelIndex, 0);
  }

  toggleMute() {
    if (this.muteState === MUTE_STATE_OFF) {
      this.muteState = MUTE_STATE_MANUAL;
    } else if (this.muteState === MUTE_STATE_MANUAL) {
      this.muteState = MUTE_STATE_OFF;
    }
  }

  toggleSolo() {
    if (this.muteState === MUTE_STATE_SOLO) {
      const autoMute = this.mixer.setAutoMutes(false, this.channelIndex);
      this.muteState = autoMute ? MUTE_STATE_AUTO : MUTE_STATE_OFF;
    } else {
      this.muteState = MUTE_STATE_SOLO;
      this.mixer.setAutoMutes(true, this.channelIndex);
    }
  }

  get muteState() {
    return this._muteState;
  }

  set muteState(value) {
    if (this.channelIndex === 3) {
      console.warn(`Channel ${this.channelIndex} is the master channel. Mute state changes ignored.`);
      return;
    }

    console.log(`Channel ${this.channelIndex}: Setting mute state to ${value}`);
    this._muteState = value;

    if (this.muteButton && this.soloButton) {
      this.muteButton.classList.toggle("active", value === MUTE_STATE_MANUAL || value === MUTE_STATE_AUTO);
      this.soloButton.classList.toggle("active", value === MUTE_STATE_SOLO);
    }

    if (value === MUTE_STATE_MANUAL || value === MUTE_STATE_AUTO) {
      this.muteGain();
    } else {
      this.updateVolume();
    }
  }

  toJSON() {
    return {
      channelIndex: this.channelIndex,
      muteState: this.muteState,
      sliderValue: this.slider.value,
    };
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
      console.error("MixerModule: moduleContent is not defined.");
      return;
    }

    const channelContainers = container.querySelectorAll(".channel-container");
    channelContainers.forEach((channelContainer, index) => {
      const slider = channelContainer.querySelector(`#slider-ch-${index + 1}`);
      const muteButton = channelContainer.querySelector(`#mute-ch-${index + 1}`);
      const soloButton = channelContainer.querySelector(`#solo-ch-${index + 1}`);
      const meter = channelContainer.querySelector(`#meter-ch-${index + 1}`);

      const channel = new Channel(this, channelContainer, slider, muteButton, soloButton, meter, this.transport, index);
      this.channels.push(channel);
    });
  }

  loadMixerSettings(mixerSettings) {
    if (!mixerSettings || typeof mixerSettings !== "object") {
      console.error("Invalid mixer settings provided.");
      return;
    }

    if (!this.channels || this.channels.length === 0) {
      console.warn("Initializing mixer channels...");
      this.channels = [];
    }

    for (let i = 0; i < 4; i++) {
      const channelSettings = mixerSettings[`channel${i + 1}`];

      if (!this.channels[i]) {
        console.warn(`Channel ${i + 1} does not exist. Creating new channel.`);
        this.channels[i] = {
          muteState: MUTE_STATE_OFF,
          slider: { value: 0.8 },
        };
      }

      if (channelSettings) {
        this.channels[i].muteState = channelSettings.muteState ?? MUTE_STATE_OFF;
        this.channels[i].slider = this.channels[i].slider || {}; // Ensure slider object exists
        this.channels[i].slider.value = channelSettings.sliderValue ?? 0.8;
      }

      console.log(`Loaded settings for Channel ${i + 1}:`, this.channels[i]);
    }

    console.log("Mixer settings successfully loaded.");
  }

  setAutoMutes(mute, index) {
    console.log(`MixerModule: setAutoMutes(${mute}, ${index}) called.`);

    this.channels.forEach((channel) => {
      if (channel.channelIndex !== index && channel.channelIndex !== 3) {
        channel.muteState = mute ? MUTE_STATE_AUTO : MUTE_STATE_OFF;
        console.log(`Channel ${channel.channelIndex} set to ${mute ? "AUTO" : "OFF"} mute.`);
      }
    });

    return mute;
  }

  toJSON() {
    return {
      channels: this.channels.map(channel => channel.toJSON()),
    };
  }
  startAnimation() {
    this.channels.forEach(channel => channel.animateMeter());
  }

  stopAnimation() {
    this.channels.forEach(channel => channel.stopMeterAnimation());
  }

}