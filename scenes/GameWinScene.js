export default class GameWinScene extends Phaser.Scene {
  constructor() {
    super("game-win");
  }

  init(data) {
    this.puntaje = typeof data.puntaje === "number" ? data.puntaje : 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x081b1f);

    this.add.text(400, 180, "¡GANASTE!", {
      fontSize: "56px",
      fill: "#00ff88",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(400, 260, "¡Has superado el desafío!", {
      fontSize: "28px",
      fill: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(400, 340, `Puntaje final: ${this.puntaje}`, {
      fontSize: "32px",
      fill: "#ffee33",
    }).setOrigin(0.5);

    this.add.text(400, 420, "Presiona R para jugar otra vez", {
      fontSize: "20px",
      fill: "#00bbff",
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-R", () => {
      this.scene.start("hello-world");
    });
  }
}
