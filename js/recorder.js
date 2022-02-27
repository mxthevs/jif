const startButton = document.querySelector("[data-id=start]");
const stopButton = document.querySelector("[data-id=stop]");

const MIME_TYPE = 'video/webm';

let mediaRecorder;

startButton.addEventListener('click', async () => {
  const stream = await getDisplayMedia();
  mediaRecorder = getRecorder(stream, MIME_TYPE);
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
});

async function getDisplayMedia () {
  return await navigator.mediaDevices.getDisplayMedia({
    video: { mediaSource: "screen" }
  });
}

function getRecorder (stream, mime_type) {
  let recorded = [];

  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recorded.push(e.data);
    }
  };

  recorder.onstop = function () {
    saveFile(recorded, mime_type);
    recorded = [];
  }

  recorder.start(200);

  return recorder;
}

function saveFile(recorded, mime_type) {
  const blob = new Blob(recorded, { type: mime_type });
  const filename = window.prompt('File name');

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${filename}.webm`;

  document.body.appendChild(anchor);
  anchor.click();

  URL.revokeObjectURL(blob);
  document.body.removeChild(anchor);
}
