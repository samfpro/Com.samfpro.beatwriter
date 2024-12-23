


async function textToAudioBlob(textToConvert, ttsSpRt, ttsVoc) {
console.log("loading voices bro");
const voices = {
  1: { name: 'en-US-Studio-M', gender: 'MALE' },
  2: { name: 'en-US-Journey-F', gender: 'FEMALE' },
  3: { name: 'en-US-Neural2-A', gender: 'MALE' },
  4: { name: 'en-US-Neural2-C', gender: 'FEMALE' },
  5: { name: 'en-US-Neural2-D', gender: 'MALE' },
  6: { name: 'en-US-Neural2-E', gender: 'FEMALE' },
  7: { name: 'en-US-Neural2-F', gender: 'FEMALE' },
  8: { name: 'en-US-Neural2-G', gender: 'FEMALE' },
  9: { name: 'en-US-Neural2-H', gender: 'FEMALE' },
  10: { name: 'en-US-Neural2-I', gender: 'MALE' },
  11: { name: 'en-US-Neural2-J', gender: 'MALE' },
  12: { name: 'en-US-News-K', gender: 'FEMALE' },
  13: { name: 'en-US-News-L', gender: 'FEMALE' },
  14: { name: 'en-US-News-N', gender: 'MALE' },
  15: { name: 'en-US-Polyglot-1', gender: 'MALE' },
  16: { name: 'en-US-Standard-A', gender: 'MALE' },
  17: { name: 'en-US-Standard-B', gender: 'MALE' },
  18: { name: 'en-US-Standard-C', gender: 'FEMALE' },
  19: { name: 'en-US-Standard-D', gender: 'MALE' },
  20: { name: 'en-US-Standard-E', gender: 'FEMALE' },
  21: { name: 'en-US-Standard-F', gender: 'FEMALE' },
  22: { name: 'en-US-Standard-G', gender: 'FEMALE' },
  23: { name: 'en-US-Standard-H', gender: 'FEMALE' },
  24: { name: 'en-US-Standard-I', gender: 'MALE' },
  25: { name: 'en-US-Standard-J', gender: 'MALE' },
  26: { name: 'en-US-Studio-O', gender: 'FEMALE' },
  27: { name: 'en-US-Studio-Q', gender: 'MALE' },
  28: { name: 'en-US-Wavenet-A', gender: 'MALE' },
  29: { name: 'en-US-Wavenet-B', gender: 'MALE' },
};

const selectedVoice = voices[ttsVoc];
console.log("the current voice is:" + selectedVoice);

  const apiKey = 'AIzaSyAUdCwRe0WxgyJB1bcHn-lYX__PLDCOGy4';

  if (!textToConvert || textToConvert.trim() === '') {
    throw new Error('Text to convert is missing or empty.');
  }

if (textToConvert.toLowerCase() === 'a'){
   textToConvert = "uh";
   console.log("changing a to uh");
}
if (textToConvert.toLowerCase() === "the"){
   textToConvert = "duh";
   console.log("changing the to duh");
}
if (textToConvert.toLowerCase() === "y"){
   textToConvert = "ee";
   console.log("changing y to ee");
}

  const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

const requestData = {
  input: {
    'text': textToConvert
  },
  voice: {
    'languageCode': 'en-US',
    'name': selectedVoice.name,
    'ssmlGender': selectedVoice.gender
  },
  audioConfig: {
    'audioEncoding': 'MP3',
    'speakingRate': ttsSpRt
  }
};

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Failed to convert text to audio: ${response.statusText}`);
    }

    const responseBody = await response.json();
    const audioContentBase64 = responseBody.audioContent;

    if (!audioContentBase64) {
      throw new Error('Audio content not found in the response.');
    }

    const audioBlob = await base64ToBlob(audioContentBase64);
    return audioBlob;
  } catch (error) {
    console.error('An error occurred while converting text to audio:' + error.message);
    throw error;
  }
}


// Helper function to convert base64 to blob
async function base64ToBlob(base64) {
  const binary = atob(base64);
  const arrayBuffer = new ArrayBuffer(binary.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  checkAudioFormat( new Blob([arrayBuffer]));
  return new Blob([arrayBuffer]);
}

async function checkAudioFormat(audioBlob) {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    
    audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      console.log('Audio format is compatible:' + buffer);
    }, (error) => {
      console.error('Error decoding audio data:' + error);
    });
  } catch (error) {
    console.error('Error checking audio format:' + error);
  }
}
console.log("textToAudioBlob.js loaded");