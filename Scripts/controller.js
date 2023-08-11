const menuCont = document.querySelector(".menu-cont"),
  mainMenu = document.querySelector("#main-menu"),
  gameMenu = document.querySelector("#game-menu"),
  menuBtn = document.querySelector("#menu-btn"),
  levelEl = document.querySelector("#level"),
  startBtn = document.querySelector("#start-btn"),
  resumeBtn = document.querySelector("#resume-btn"),
  mainMenuBtn = document.querySelector("#main-menu-btn");

const startGame = () => {
  frameObj.rows = levelEl.value;
  frameObj.cols = levelEl.value;

  initPieces();
  randmizePieces();

  menuCont.classList.add("hide");
  mainMenu.classList.add("hide");
  gameMenu.classList.remove("hide");
  menuBtn.classList.remove("hide");
  isPlaying = true;
};

function finishGame() {
  isPlaying = false;
  menuCont.classList.remove("hide");
  mainMenu.classList.remove("hide");
  gameMenu.classList.add("hide");
  menuBtn.classList.add("hide");
}

startBtn.onclick = startGame;
mainMenuBtn.onclick = finishGame;

resumeBtn.onclick = () => {
  menuCont.classList.add("hide");
};
menuBtn.onclick = () => {
  menuCont.classList.toggle("hide");
};
