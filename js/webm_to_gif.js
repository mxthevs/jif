const videoInput = document.querySelector('[data-id=webm_input]');

const videoElement = document.querySelector('[data-id=video]');
const videoSourceElement = document.querySelector('[data-id=video_source]')

const resultElement = document.querySelector('[data-id=result]');
const convertButton = document.querySelector('[data-id=convert]');

const infoMessage = document.querySelector('[data-id=info_message]');

let timerId = null;
const INTERVAL = 20 // ms

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

videoElement.addEventListener('play', function () {
  clearInterval(timerId);
  timerId = setInterval(capture, INTERVAL)
});

videoElement.addEventListener('ended', function () {
  clearInterval(timerId);
  gif.render();
})

gif.on('finished', function (blob) {
  resultElement.src = URL.createObjectURL(blob);
  resultElement.style.display = 'block';
  convertButton.disabled = true;
  infoMessage.style.display = 'none';
});

function handleInput (event) {
  if (event.target.files && event.target.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      videoElement.src = e.target.result
    }.bind(this)

    reader.readAsDataURL(event.target.files[0]);

    videoElement.style.display = 'block';
    convertButton.disabled = false;
  }
}

function handleConversion () {
  convertButton.disabled = true;
  infoMessage.style.display = 'block';

  videoElement.pause();
  videoElement.currentTime = 0;
  gif.abort();
  gif.frames = [];

  // TODO: allow user to specify output dimensions
  gif.options.width = videoElement.videoWidth;
  gif.options.height = videoElement.videoHeight;

  console.log(gif)

  videoElement.play();
}

function capture () {
  gif.addFrame(videoElement, { copy: true, delay: INTERVAL });
}
