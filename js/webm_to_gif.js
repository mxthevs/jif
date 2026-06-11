const videoInput = document.querySelector('[data-id=webm_input]');

const videoElement = document.querySelector('[data-id=video]');

const resultElement = document.querySelector('[data-id=result]');
const convertButton = document.querySelector('[data-id=convert]');

const infoMessage = document.querySelector('[data-id=info_message]');
const boomerangCheckbox = document.querySelector('[data-id=boomerang]');

const INTERVAL = 20;

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d', {
  willReadFrequently: true,
});

let capturedFrames = [];
let isCapturing = false;

const gif = new GIF({
  workers: 4,
  workerScript: './js/vendor/gif.worker.js',
  width: 600,
  height: 420,
});

convertButton.disabled = true;
videoElement.style.display = 'none';
resultElement.style.display = 'none';
infoMessage.style.display = 'none';

videoInput.addEventListener('change', handleInput);
convertButton.addEventListener('click', handleConversion);

videoElement.addEventListener('ended', handleVideoEnded);

gif.on('finished', function (blob) {
  resultElement.src = URL.createObjectURL(blob);
  resultElement.style.display = 'block';

  convertButton.disabled = false;
  infoMessage.style.display = 'none';
});

function handleInput(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    videoElement.src = e.target.result;
  };

  reader.readAsDataURL(file);

  videoElement.style.display = 'block';
  resultElement.style.display = 'none';
  convertButton.disabled = false;
}

function handleConversion() {
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    return;
  }

  convertButton.disabled = true;
  resultElement.style.display = 'none';
  infoMessage.style.display = 'block';

  capturedFrames = [];

  gif.abort();
  gif.frames = [];

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  gif.options.width = videoElement.videoWidth;
  gif.options.height = videoElement.videoHeight;

  videoElement.pause();
  videoElement.currentTime = 0;

  videoElement.addEventListener(
    'seeked',
    function startCapture() {
      videoElement.removeEventListener('seeked', startCapture);

      isCapturing = true;
      startFrameCapture();

      videoElement.play();
    },
    { once: true }
  );
}

function handleVideoEnded() {
  isCapturing = false;

  buildGif();
}

function startFrameCapture() {
  if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
    videoElement.requestVideoFrameCallback(captureVideoFrame);
  } else {
    fallbackCaptureLoop();
  }
}

function captureVideoFrame() {
  if (!isCapturing) {
    return;
  }

  captureFrame();

  videoElement.requestVideoFrameCallback(captureVideoFrame);
}

function fallbackCaptureLoop() {
  if (!isCapturing) {
    return;
  }

  captureFrame();

  setTimeout(fallbackCaptureLoop, INTERVAL);
}

function captureFrame() {
  context.drawImage(
    videoElement,
    0,
    0,
    canvas.width,
    canvas.height
  );

  capturedFrames.push(
    context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    )
  );
}

function buildGif() {
  let frames = capturedFrames;

  if (
    boomerangCheckbox.checked &&
    capturedFrames.length > 2
  ) {
    frames = [
      ...capturedFrames,
      ...capturedFrames.slice(1, -1).reverse(),
    ];
  }

  for (const frame of frames) {
    gif.addFrame(frame, {
      copy: true,
      delay: INTERVAL,
    });
  }

  gif.render();
}