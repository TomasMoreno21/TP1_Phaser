export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  init(data) {
    this.gano = data.gano || false;
    this.puntaje = typeof data.puntaje === "number" ? data.puntaje : 0;
  }

  preload() {
    this.load.image('fondoMenu', 'public/assets/FondoMenu.jpg');
  }

  create() {
    this.add.image(400, 300, 'fondoMenu').setDisplaySize(800, 600);

    const titulo = this.gano ? "¡GANASTE!" : "¡PERDISTE!";
    const colorTitulo = this.gano ? "#00ff00" : "#ff0000";

    this.add.text(400, 180, titulo, {
      fontSize: "56px",
      fill: colorTitulo,
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(400, 280, `Puntaje final: ${this.puntaje}`, {
      fontSize: "32px",
      fill: "#000000",
    }).setOrigin(0.5);

    this.add.text(400, 360, "Gracias por jugar", {
      fontSize: "24px",
      fill: "#000000",
    }).setOrigin(0.5);

    this.add.text(400, 430, "Presiona R para volver a jugar", {
      fontSize: "20px",
      fill: "#000000",
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-R", () => {
      this.scene.start("hello-world");
    });
  }
}
