class BoolSwitch {
    constructor(container, initialState, labelText, onStateChange) {
        console.log('Initializing BoolSwitch...');

        // Store the state and container
        this.state = initialState;
        console.log(`Initial state set to: ${this.state}`);

        this.container = container;
        console.log(`Container provided: `, this.container);

        this.onStateChange = onStateChange; // Callback for state changes
        console.log(`State change callback provided: ${typeof this.onStateChange}`);

        // Create the main channel
        console.log('Creating channel...');
        this.channel = document.createElement('div');
        this.channel.classList.add('bool-switch-channel');
        this.channel.style.position = 'relative';
        this.channel.style.overflow = 'hidden';
        console.log('Channel created and styled: ', this.channel);

        // Create the left thumb
        console.log('Creating left thumb...');
        this.leftThumb = document.createElement('div');
        this.leftThumb.classList.add('bool-switch-thumb', 'left-thumb');
        this.leftThumb.style.transition = 'opacity 0.2s';
        this.leftThumb.style.opacity = this.state ? '0' : '1';
        console.log(`Left thumb created with opacity: ${this.leftThumb.style.opacity}`);

        // Create the right thumb
        console.log('Creating right thumb...');
        this.rightThumb = document.createElement('div');
        this.rightThumb.classList.add('bool-switch-thumb', 'right-thumb');
        this.rightThumb.style.transition = 'opacity 0.2s';
        this.rightThumb.style.opacity = this.state ? '1' : '0';
        console.log(`Right thumb created with opacity: ${this.rightThumb.style.opacity}`);

        // Append thumbs to the channel
        console.log('Appending thumbs to the channel...');
        this.channel.appendChild(this.leftThumb);
        this.channel.appendChild(this.rightThumb);
        console.log('Thumbs appended to the channel:', this.channel);

        // Create the label
        console.log('Creating label...');
        this.label = document.createElement('span');
        this.label.classList.add('bool-switch-label');
        this.label.textContent = labelText;
        this.label.style.marginLeft = '10px';
        console.log(`Label created with text: "${this.label.textContent}"`);

        // Append the channel and label to the container
        console.log('Appending channel and label to the container...');
        this.container.appendChild(this.label);
        this.container.appendChild(this.channel);
        console.log('Channel and label appended to container:', this.container);

        // Add event listener for toggle functionality
        console.log('Adding click event listener to toggle state...');
        this.channel.addEventListener('click', () => {
            console.log('Channel clicked.');
            this.toggle();
        });
    }

    // Toggles the state and updates the UI
    toggle() {
        console.log(`Toggling state. Current state: ${this.state}`);
        this.state = !this.state;
        console.log(`State toggled. New state: ${this.state}`);
        this.updateUI();

        // Notify parent about the state change
        if (this.onStateChange) {
            console.log('Calling onStateChange callback with new state: ', this.state);
            this.onStateChange(this.state);
        } else {
            console.log('No onStateChange callback provided.');
        }
    }

    // Updates the UI based on the current state
    updateUI() {
        console.log('Updating UI...');
        console.log(`Left thumb opacity: ${this.state ? '0' : '1'}`);
        this.leftThumb.style.opacity = this.state ? '0' : '1';
        console.log(`Right thumb opacity: ${this.state ? '1' : '0'}`);
        this.rightThumb.style.opacity = this.state ? '1' : '0';
    }

    // Sets the state programmatically
    setState(newState) {
        console.log(`Setting state programmatically. New state: ${newState}`);
        this.state = newState;
        this.updateUI();
    }

    // Gets the current state
    getState() {
        console.log('Getting current state:', this.state);
        return this.state;
    }
}