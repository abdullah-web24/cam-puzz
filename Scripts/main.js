const mainCanvas = document.querySelector("#main-canvas"),
  ghostCanvas = document.createElement("canvas"),
  mainCtx = mainCanvas.getContext("2d"),
  ghostCtx = ghostCanvas.getContext("2d", { willReadFrequently: true }),
  videoEl = document.createElement("video"),
  frameRatio = 0.8,
  frameObj = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rows: undefined,
    cols: undefined,
  },
  popSound = new Audio("./Sources/Audio/pop.mp3"),
  winSound = new Audio("./Sources/Audio/win.mp3");

let framePieces = [],
  selectedPiece = undefined,
  isPlaying = false;

popSound.volume = 0.3;

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
  thisObj.minSize = Math.min(thisObj.width, thisObj.height);

  thisObj.tab = {
    neck: thisObj.minSize * 0.1,
    width: thisObj.minSize * 0.2,
    height: thisObj.minSize * 0.2,

    scaledHeight:
      Math.min(
        videoEl.videoWidth / frameObj.cols,
        videoEl.videoHeight / frameObj.rows
      ) * 0.2,
  };
};

const resizer = () => {
  mainCanvas.height = innerHeight;
  mainCanvas.width = innerWidth;

  ghostCanvas.height = innerHeight;
  ghostCanvas.width = innerWidth;

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
  constructor(rowIndx, colIndx, color) {
    this.rowIndx = rowIndx;
    this.colIndx = colIndx;
    this.color = color;
    this.isCorrect = false;

    piecePropCalc(this);

    this.tabSides = {
      top: undefined,
      bottom: undefined,
      left: undefined,
      right: undefined,
    };
  }

  draw(ctx, useCam = true) {
    ctx.beginPath();

    this.isCorrect
      ? (ctx.strokeStyle = "rgb(50, 253, 50)")
      : (ctx.strokeStyle = "rgb(253, 50, 50)");

    // ctx.rect(this.x, this.y, this.width, this.height);
    ctx.moveTo(this.x, this.y);

    // Top
    if (this.tabSides.top) {
      ctx.lineTo(
        this.x + this.width * Math.abs(this.tabSides.top) - this.tab.neck,
        this.y
      );

      ctx.bezierCurveTo(
        this.x + this.width * Math.abs(this.tabSides.top) - this.tab.neck,
        this.y - this.tab.height * Math.sign(this.tabSides.top) * 0.2,

        this.x + this.width * Math.abs(this.tabSides.top) - this.tab.width,
        this.y - this.tab.height * Math.sign(this.tabSides.top),

        this.x + this.width * Math.abs(this.tabSides.top),
        this.y - this.tab.height * Math.sign(this.tabSides.top)
      );

      ctx.bezierCurveTo(
        this.x + this.width * Math.abs(this.tabSides.top) + this.tab.width,
        this.y - this.tab.height * Math.sign(this.tabSides.top),

        this.x + this.width * Math.abs(this.tabSides.top) + this.tab.neck,
        this.y - this.tab.height * Math.sign(this.tabSides.top) * 0.2,

        this.x + this.width * Math.abs(this.tabSides.top) + this.tab.neck,
        this.y
      );

      // ctx.lineTo(
      //   this.x + this.width * Math.abs(this.tabSides.top),
      //   this.y - this.tab.height * Math.sign(this.tabSides.top)
      // );

      // ctx.lineTo(
      //   this.x + this.width * Math.abs(this.tabSides.top) + this.tab.neck,
      //   this.y
      // );
    }
    ctx.lineTo(this.x + this.width, this.y);

    // Right
    if (this.tabSides.right) {
      ctx.lineTo(
        this.x + this.width,
        this.y + this.height * Math.abs(this.tabSides.right) - this.tab.neck
      );

      ctx.bezierCurveTo(
        this.x +
          this.width -
          this.tab.height * Math.sign(this.tabSides.right) * 0.2,
        this.y + this.height * Math.abs(this.tabSides.right) - this.tab.neck,

        this.x + this.width - this.tab.height * Math.sign(this.tabSides.right),
        this.y + this.height * Math.abs(this.tabSides.right) - this.tab.width,

        this.x + this.width - this.tab.height * Math.sign(this.tabSides.right),
        this.y + this.height * Math.abs(this.tabSides.right)
      );

      ctx.bezierCurveTo(
        this.x + this.width - this.tab.height * Math.sign(this.tabSides.right),
        this.y + this.height * Math.abs(this.tabSides.right) + this.tab.width,

        this.x +
          this.width -
          this.tab.height * Math.sign(this.tabSides.right) * 0.2,
        this.y + this.height * Math.abs(this.tabSides.right) + this.tab.neck,

        this.x + this.width,
        this.y + this.height * Math.abs(this.tabSides.right) + this.tab.neck
      );

      // ctx.lineTo(
      //   this.x + this.width - this.tab.height * Math.sign(this.tabSides.right),
      //   this.y + this.height * Math.abs(this.tabSides.right)
      // );
      // ctx.lineTo(
      //   this.x + this.width,
      //   this.y + this.height * Math.abs(this.tabSides.right) + this.tab.neck
      // );
    }
    ctx.lineTo(this.x + this.width, this.y + this.height);

    //Bottom
    if (this.tabSides.bottom) {
      ctx.lineTo(
        this.x + this.width * Math.abs(this.tabSides.bottom) + this.tab.neck,
        this.y + this.height
      );

      ctx.bezierCurveTo(
        this.x + this.width * Math.abs(this.tabSides.bottom) + this.tab.neck,
        this.y +
          this.height +
          this.tab.height * Math.sign(this.tabSides.bottom) * 0.2,

        this.x + this.width * Math.abs(this.tabSides.bottom) + this.tab.width,
        this.y +
          this.height +
          this.tab.height * Math.sign(this.tabSides.bottom),

        this.x + this.width * Math.abs(this.tabSides.bottom),
        this.y + this.height + this.tab.height * Math.sign(this.tabSides.bottom)
      );

      ctx.bezierCurveTo(
        this.x + this.width * Math.abs(this.tabSides.bottom) - this.tab.width,
        this.y +
          this.height +
          this.tab.height * Math.sign(this.tabSides.bottom),

        this.x + this.width * Math.abs(this.tabSides.bottom) - this.tab.neck,
        this.y +
          this.height +
          this.tab.height * Math.sign(this.tabSides.bottom) * 0.2,

        this.x + this.width * Math.abs(this.tabSides.bottom) - this.tab.neck,
        this.y + this.height
      );

      // ctx.lineTo(
      //   this.x + this.width * Math.abs(this.tabSides.bottom),
      //   this.y + this.height + this.tab.height * Math.sign(this.tabSides.bottom)
      // );
      // ctx.lineTo(
      //   this.x + this.width * Math.abs(this.tabSides.bottom) - this.tab.neck,
      //   this.y + this.height
      // );
    }
    ctx.lineTo(this.x, this.y + this.height);

    // Left
    if (this.tabSides.left) {
      ctx.lineTo(
        this.x,
        this.y + this.height * Math.abs(this.tabSides.left) + this.tab.neck
      );

      ctx.bezierCurveTo(
        this.x + this.tab.height * Math.sign(this.tabSides.left) * 0.2,
        this.y + this.height * Math.abs(this.tabSides.left) + this.tab.neck,

        this.x + this.tab.height * Math.sign(this.tabSides.left),
        this.y + this.height * Math.abs(this.tabSides.left) + this.tab.width,

        this.x + this.tab.height * Math.sign(this.tabSides.left),
        this.y + this.height * Math.abs(this.tabSides.left)
      );

      ctx.bezierCurveTo(
        this.x + this.tab.height * Math.sign(this.tabSides.left),
        this.y + this.height * Math.abs(this.tabSides.left) - this.tab.width,

        this.x + this.tab.height * Math.sign(this.tabSides.left) * 0.2,
        this.y + this.height * Math.abs(this.tabSides.left) - this.tab.neck,

        this.x,
        this.y + this.height * Math.abs(this.tabSides.left) - this.tab.neck
      );

      // ctx.lineTo(
      //   this.x + this.tab.height * Math.sign(this.tabSides.left),
      //   this.y + this.height * Math.abs(this.tabSides.left)
      // );
      // ctx.lineTo(
      //   this.x,
      //   this.y + this.height * Math.abs(this.tabSides.left) - this.tab.neck
      // );
    }
    ctx.lineTo(this.x, this.y);

    ctx.save();
    ctx.clip();

    if (useCam) {
      ctx.drawImage(
        videoEl,
        this.colIndx * (videoEl.videoWidth / frameObj.cols) -
          this.tab.scaledHeight,
        this.rowIndx * (videoEl.videoHeight / frameObj.rows) -
          this.tab.scaledHeight,
        videoEl.videoWidth / frameObj.cols + this.tab.scaledHeight * 2,
        videoEl.videoHeight / frameObj.rows + this.tab.scaledHeight * 2,
        this.x - this.tab.height,
        this.y - this.tab.height,
        this.width + this.tab.height * 2,
        this.height + this.tab.height * 2
      );

      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(
        this.x - this.tab.height,
        this.y - this.tab.height,
        this.width + this.tab.height * 2,
        this.height + this.tab.height * 2
      );
    }

    ctx.restore();
  }

  isClose() {
    if (
      getDist(
        { x: this.x, y: this.y },
        { x: this.correctX, y: this.correctY }
      ) <
      this.minSize * 0.3
    )
      return true;
  }

  snap() {
    popSound.play();
    this.isCorrect = true;
    this.x = this.correctX;
    this.y = this.correctY;
  }

  createSide(side, relatedTab) {
    const sign = Math.random() - 0.5 > 0 ? 1 : -1;
    if (side === "left") {
      this.tabSides[side] = -relatedTab.tabSides.right;
    } else if (side === "top") {
      this.tabSides[side] = -relatedTab.tabSides.bottom;
    } else {
      this.tabSides[side] = sign * (Math.random() * 0.4 + 0.3);
    }
  }
}

const getRandomColor = () => {
  const red = Math.floor(Math.random() * 255) + 1,
    green = Math.floor(Math.random() * 255) + 1,
    blue = Math.floor(Math.random() * 255) + 1;

  return `rgb(${red},${green},${blue})`;
};

const initPieces = () => {
  framePieces = [];

  for (i = 0; i < frameObj.rows; i++) {
    for (j = 0; j < frameObj.cols; j++) {
      let color = getRandomColor();

      while (framePieces.color === color) {
        color = getRandomColor();
      }

      const piece = new Piece(i, j, color);
      framePieces.push(piece);
    }
  }

  framePieces.forEach((piece, i) => {
    if (piece.rowIndx !== frameObj.rows - 1) {
      piece.createSide("bottom");
    }

    if (piece.colIndx !== frameObj.cols - 1) {
      piece.createSide("right");
    }

    if (piece.rowIndx !== 0) {
      piece.createSide("top", framePieces[i - frameObj.cols]);
    }

    if (piece.colIndx !== 0) {
      piece.createSide("left", framePieces[i - 1]);
    }
  });
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
    ghostCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    mainCtx.beginPath();
    mainCtx.strokeStyle = "rgb(253, 253, 253)";
    mainCtx.rect(frameObj.x, frameObj.y, frameObj.width, frameObj.height);
    mainCtx.stroke();

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
      piece.draw(ghostCtx, false);
    });

    const isGameOver = framePieces.every((piece) => piece.isCorrect);

    if (isGameOver) {
      finishGame();
    }
  }
  requestAnimationFrame(updateCanvas);
};

videoEl.onloadeddata = () => {
  resizer();

  // Getting the right camera
  mainCtx.translate(mainCanvas.width, 0);
  mainCtx.scale(-1, 1);
  ghostCtx.translate(mainCanvas.width, 0);
  ghostCtx.scale(-1, 1);

  updateCanvas();
};

const getSelectedPiece = (e) => {
  if (!isPlaying) return undefined;

  const imgData = ghostCtx.getImageData(e.clientX, e.clientY, 1, 1).data;

  if (imgData[3] === 0) return undefined;

  const pointedColor = `rgb(${imgData[0]},${imgData[1]},${imgData[2]})`;

  for (i = framePieces.length - 1; i >= 0; i--) {
    const piece = framePieces[i];

    if (piece.color === pointedColor && !piece.isCorrect) return piece;
  }

  // for (i = framePieces.length - 1; i >= 0; i--) {
  //   const piece = framePieces[i];

  //   if (
  //     e.clientX > piece.x &&
  //     e.clientX < piece.x + piece.width &&
  //     e.clientY > piece.y &&
  //     e.clientY < piece.y + piece.height &&
  //     !piece.isCorrect
  //   )
  //     return piece;
  // }

  return undefined;
};

mainCanvas.addEventListener("pointerdown", (e) => {
  selectedPiece = getSelectedPiece(e);

  if (selectedPiece) {
    selectedPiece.offsets = {
      y: e.clientY - selectedPiece.y,
      // The canvas is flipped in x axix
      x: mainCanvas.width - e.clientX - selectedPiece.x,
    };

    framePieces.splice(framePieces.indexOf(selectedPiece), 1);
    framePieces.push(selectedPiece);
  }
});

mainCanvas.addEventListener("pointermove", (e) => {
  console.log(e.clientX);
  if (selectedPiece) {
    selectedPiece.y = e.clientY - selectedPiece.offsets.y;

    // The canvas is flipped in x axix
    selectedPiece.x = mainCanvas.width - e.clientX - selectedPiece.offsets.x;
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
