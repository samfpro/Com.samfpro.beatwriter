class BPMDetector {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * Analyzes an audio file and calculates the BPM.
     * @param {File} audioFile - The audio file to analyze.
     * @returns {Promise<number>} - A promise that resolves with the calculated BPM.
     */
    async analyzeBPM(audioFile) {
        const audioBuffer = await this._loadAudioBuffer(audioFile);
        const audioData = audioBuffer.getChannelData(0); // Use the first channel for analysis.

        const peaks = this._getPeaks(audioData);
        const intervals = this._getIntervals(peaks);
        const bpm = this._calculateBPM(intervals);

        return bpm;
    }

    // Private methods

    async _loadAudioBuffer(audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        return this.audioContext.decodeAudioData(arrayBuffer);
    }

    _getPeaks(data) {
        const peaks = [];
        const threshold = 0.95;

        for (let i = 0; i < data.length; i++) {
            if (data[i] > threshold) {
                peaks.push(i);
                // Skip some samples to avoid multiple detections of the same peak
                i += 10000;
            }
        }

        return peaks;
    }

    _getIntervals(peaks) {
        const intervals = [];

        for (let i = 0; i < peaks.length; i++) {
            for (let j = i + 1; j < peaks.length; j++) {
                const interval = peaks[j] - peaks[i];
                intervals.push(interval);
            }
        }

        return intervals;
    }

_calculateBPM(intervals) {
    const tempoCounts = {};

    intervals.forEach(interval => {
        const bpm = (60 * this.audioContext.sampleRate) / interval;
        if (bpm > 30 && bpm < 300) { // Filter unrealistic BPM values
            const roundedBPM = Math.round(bpm);
            tempoCounts[roundedBPM] = (tempoCounts[roundedBPM] || 0) + 1;
        }
    });

    let bestTempo = 0;
    let maxCount = 0;

    for (const bpm in tempoCounts) {
        if (tempoCounts[bpm] > maxCount) {
            bestTempo = bpm;
            maxCount = tempoCounts[bpm];
        }
    }

    // Round to the nearest quarter
    const roundedToQuarter = Math.round(bestTempo * 4) / 4;
    return roundedToQuarter;
}
}

// Usage example:
// const bpmDetector = new BPMDetector();
// const audioFile = document.querySelector('input[type="file"]').files[0];
// bpmDetector.analyzeBPM(audioFile).then(bpm => console.log(`BPM: ${bpm}`));