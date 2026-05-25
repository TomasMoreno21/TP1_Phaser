export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  init(data) {
    this.gano = data.gano || false;
    this.puntaje = typeof data.puntaje === "number" ? data.puntaje : 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x10121a);

    const titulo = this.gano ? "¡GANASTE!" : "¡PERDISTE!";
    const colorTitulo = this.gano ? "#00ff00" : "#ff0000";

    this.add.text(400, 180, titulo, {
      fontSize: "56px",
      fill: colorTitulo,
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(400, 280, `Puntaje final: ${this.puntaje}`, {
      fontSize: "32px",
      fill: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(400, 360, "Gracias por jugar", {
      fontSize: "24px",
      fill: "#aaaaaa",
    }).setOrigin(0.5);

    this.add.text(400, 430, "Presiona R para volver a jugar", {
      fontSize: "20px",
      fill: "#00bbff",
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-R", () => {
      this.scene.start("hello-world");
    });
  }
}
