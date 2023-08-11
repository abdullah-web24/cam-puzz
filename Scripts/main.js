const mainCanvas = document.querySelector("#main-canvas"),
  mainCtx = mainCanvas.getContext("2d"),
  videoEl = document.createElement("video"),
  frameRatio = 0.8,
  frameObj = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rows: undefined,
    cols: undefined,
  };

let framePieces = [],
  selectedPiece = undefined,
  isPlaying = false;

const getCamera = async () => {
  try {
    const media = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoEl.srcObject = media;
    videoEl.play();
  } catch (err) {
    console.log(`Media error: ${err}`);
  }
};
getCamera();

const getDist = (p1, p2) =>
  Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));

const piecePropCalc = (thisObj) => {
  thisObj.width = frameObj.width / frameObj.cols;
  thisObj.height = frameObj.height / frameObj.rows;
  thisObj.correctX = frameObj.x + thisObj.width * thisObj.colIndx;
  thisObj.correctY = frameObj.y + thisObj.height * thisObj.rowIndx;
  thisObj.x = thisObj.correctX;
  thisObj.y = thisObj.correctY;
};

const resizer = () => {
  mainCanvas.height = innerHeight;
  mainCanvas.width = innerWidth;

  const ratio =
    frameRatio *
    Math.min(
      innerHeight / videoEl.videoHeight,
      innerWidth / videoEl.videoWidth
    );

  frameObj.height = ratio * videoEl.videoHeight;
  frameObj.width = ratio * videoEl.videoWidth;
  frameObj.x = innerWidth / 2 - frameObj.width / 2;
  frameObj.y = innerHeight / 2 - frameObj.height / 2;

  framePieces.forEach((piece) => {
    piecePropCalc(piece);
  });
};

class Piece {
  constructor(rowIndx, colIndx) {
    this.rowIndx = rowIndx;
    this.colIndx = colIndx;
    this.iscorrect = false;
    piecePropCalc(this);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "rgb(253, 253, 253)";
    ctx.rect(this.x, this.y, this.width, this.height);

    ctx.drawImage(
      videoEl,
      this.colIndx * (videoEl.videoWidth / frameObj.cols),
      this.rowIndx * (videoEl.videoHeight / frameObj.rows),
      videoEl.videoWidth / frameObj.cols,
      videoEl.videoHeight / frameObj.rows,
      this.x,
      this.y,
      this.width,
      this.height
    );

    ctx.stroke();
  }

  isClose() {
    if (
      getDist(
        { x: this.x, y: this.y },
        { x: this.correctX, y: this.correctY }
      ) <
      this.width * 0.3
    )
      return true;
  }

  snap() {
    this.iscorrect = true;
    this.x = this.correctX;
    this.y = this.correctY;
  }
}

const initPieces = () => {
  framePieces = [];

  for (i = 0; i < frameObj.rows; i++) {
    for (j = 0; j < frameObj.cols; j++) {
      framePieces.push(new Piece(i, j));
    }
  }
};

const randmizePieces = () => {
  framePieces.forEach((piece) => {
    const randmLoc = {
      x: Math.random() * (mainCanvas.width - piece.width),
      y: Math.random() * (mainCanvas.height - piece.height),
    };

    piece.x = randmLoc.x;
    piece.y = randmLoc.y;
  });
};

const updateCanvas = () => {
  if (isPlaying) {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    mainCtx.globalAlpha = 0.1;
    mainCtx.drawImage(
      videoEl,
      frameObj.x,
      frameObj.y,
      frameObj.width,
      frameObj.height
    );
    mainCtx.globalAlpha = 1;

    framePieces.forEach((piece) => {
      piece.draw(mainCtx);
    });

    const isGameOver = framePieces.every((piece) => piece.iscorrect);

    if (isGameOver) {
      finishGame();
    }
  }
  requestAnimationFrame(updateCanvas);
};

videoEl.onloadeddata = () => {
  resizer();

  updateCanvas();
};

const getSelectedPiece = (e) => {
  for (i = framePieces.length - 1; i >= 0; i--) {
    const piece = framePieces[i];

    if (
      e.clientX > piece.x &&
      e.clientX < piece.x + piece.width &&
      e.clientY > piece.y &&
      e.clientY < piece.y + piece.height &&
      !piece.iscorrect
    )
      return piece;
  }

  return undefined;
};

mainCanvas.addEventListener("pointerdown", (e) => {
  selectedPiece = getSelectedPiece(e);

  if (selectedPiece) {
    selectedPiece.offsets = {
      x: e.clientX - selectedPiece.x,
      y: e.clientY - selectedPiece.y,
    };

    framePieces.splice(framePieces.indexOf(selectedPiece), 1);
    framePieces.push(selectedPiece);
  }
});

mainCanvas.addEventListener("pointermove", (e) => {
  if (selectedPiece) {
    selectedPiece.x = e.clientX - selectedPiece.offsets.x;
    selectedPiece.y = e.clientY - selectedPiece.offsets.y;
  }
});

mainCanvas.addEventListener("pointerup", () => {
  if (selectedPiece?.isClose()) {
    selectedPiece.snap();
    framePieces.pop();
    framePieces.unshift(selectedPiece);
  }

  selectedPiece = undefined;
});

window.addEventListener("resize", resizer);
