// Base scene for the next step of the game.
// It adds falling collectible items and a simple win condition.

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  init() {
    this.jugador = null;
    this.controles = null;
    this.objetos = null;
    this.plataformas = null;
    this.recolectados = [];
    this.conteos = { square: 0, triangle: 0, diamond: 0, skull: 0 };
    this.puntaje = 0;
    this.puntajesObjetos = { square: 5, triangle: 8, diamond: 12, skull: -5 };
    this.textoEstado = null;
    this.textoPuntaje = null;
    this.textoTiempo = null;
    this.tiempoRestante = 25;
    this.finDelJuego = false;
  }

  preload() {
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600);
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    const suelo = this.add.rectangle(400, 560, 800, 80, 0x4e9f3d);
    this.physics.add.existing(suelo, true);

    const datosPlataforma = [
      { x: 100, y: 430, width: 160, height: 24 },
      { x: 700, y: 430, width: 160, height: 24 },
    ];
    this.plataformas = datosPlataforma.map((plataforma) => {
      const plataformaRect = this.add.rectangle(
        plataforma.x,
        plataforma.y,
        plataforma.width,
        plataforma.height,
        0x4e9f3d
      );
      this.physics.add.existing(plataformaRect, true);
      return plataformaRect;
    });

    this.jugador = this.add.rectangle(400, 480, 48, 64, 0xe63946);
    this.physics.add.existing(this.jugador);
    this.jugador.body.setCollideWorldBounds(true);
    this.jugador.body.setBounce(0.1);
    this.jugador.body.setGravityY(600);

    this.physics.add.collider(this.jugador, suelo);
    this.plataformas.forEach((plataforma) => {
      this.physics.add.collider(this.jugador, plataforma);
    });

    this.controles = this.input.keyboard.createCursorKeys();

    this.objetos = this.physics.add.group();
    this.physics.add.collider(this.objetos, suelo, this.colisionObjetoSuelo, null, this);
    this.plataformas.forEach((plataforma) => {
      this.physics.add.collider(this.objetos, plataforma, this.colisionObjetoSuelo, null, this);
    });
    this.physics.add.overlap(this.jugador, this.objetos, this.recolectarObjeto, null, this);

    this.textoEstado = this.add.text(16, 16, "Objetos: 0 / 0 / 0 / 0", {
      fontSize: "20px",
      fill: "#ffffff",
    });

    this.textoPuntaje = this.add.text(16, 44, "Puntaje: 0", {
      fontSize: "20px",
      fill: "#00ffff",
    });

    this.textoTiempo = this.add.text(16, 72, `Tiempo: ${this.tiempoRestante}`, {
      fontSize: "20px",
      fill: "#ffcc00",
    });

    this.add.text(16, 100, "Supera 100 puntos para ganar", {
      fontSize: "18px",
      fill: "#d7227a",
    });

    this.time.addEvent({
      delay: 500,
      callback: this.generarObjeto,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 1000,
      callback: this.disminuirTemporizador,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.finDelJuego) {
      this.jugador.body.setVelocityX(0);
      return;
    }

    const velocidad = 350;
    const velocidadSalto = -420;

    if (this.controles.left.isDown) {
      this.jugador.body.setVelocityX(-velocidad);
    } else if (this.controles.right.isDown) {
      this.jugador.body.setVelocityX(velocidad);
    } else {
      this.jugador.body.setVelocityX(0);
    }

    if (this.controles.up.isDown && this.jugador.body.blocked.down) {
      this.jugador.body.setVelocityY(velocidadSalto);
    }
  }

  disminuirTemporizador() {
    if (this.finDelJuego) {
      return;
    }

    this.tiempoRestante -= 1;
    this.textoTiempo.setText(`Tiempo: ${this.tiempoRestante}`);

    if (this.tiempoRestante <= 0) {
      this.terminarJuego(false);
    }
  }

  generarObjeto() {
    const tipos = ["square", "triangle", "diamond", "skull"];
    const tipo = Phaser.Utils.Array.GetRandom(tipos);
    const x = Phaser.Math.Between(50, 750);
    const y = -20;

    let objeto;
    if (tipo === "square") {
      objeto = this.add.rectangle(x, y, 36, 36, 0xffcc00);
    } else if (tipo === "triangle") {
      objeto = this.add.triangle(x, y, 0, 36, 18, 0, 36, 36, 0x4bcffa);
    } else if (tipo === "diamond") {
      objeto = this.add.polygon(x, y, [0, 18, 18, 0, 36, 18, 18, 36], 0xff6b6b);
    } else {
      objeto = this.add.circle(x, y, 18, 0x9b5de5);
    }

    this.physics.add.existing(objeto);
    objeto.puntosRestantes = this.puntajesObjetos[tipo] || 0;
    objeto.esPenalidad = tipo === "skull";
    objeto.rebotesSuelo = 0;
    objeto.body.setCollideWorldBounds(true);
    objeto.body.setGravityY(200);
    objeto.tipoObjeto = tipo;
    objeto.body.setSize(objeto.width, objeto.height, true);

    this.objetos.add(objeto);
    objeto.body.setBounce(0.6);
  }

  colisionObjetoSuelo(objA, objB) {
    if (this.finDelJuego) return;

    const buscarObjeto = (a, b) => {
      const candidatos = [a, b];
      for (const o of candidatos) {
        if (!o) continue;
        if (o.tipoObjeto && (o.tipoObjeto === 'square' || o.tipoObjeto === 'triangle' || o.tipoObjeto === 'diamond')) return o;
        if (o.body && o.body.gameObject && o.body.gameObject.tipoObjeto) return o.body.gameObject;
        if (o.gameObject && o.gameObject.tipoObjeto) return o.gameObject;
      }
      return null;
    };

    const objeto = buscarObjeto(objA, objB);
    if (!objeto || !objeto.body) return;

    if (typeof objeto.puntosRestantes === 'undefined') {
      objeto.puntosRestantes = this.puntajesObjetos[objeto.tipoObjeto] || 0;
    }

    const ahora = this.time.now;
    if (objeto.ultimoGolpeSuelo && ahora - objeto.ultimoGolpeSuelo < 200) {
      return;
    }
    objeto.ultimoGolpeSuelo = ahora;

    if (objeto.esPenalidad) {
      if (objeto.rebotesSuelo >= 1) {
        objeto.destroy();
      } else {
        objeto.rebotesSuelo += 1;
      }
      return;
    }

    objeto.puntosRestantes -= 5;
    if (objeto.puntosRestantes <= 0) {
      objeto.destroy();
    } else {
      const maximo = this.puntajesObjetos[objeto.tipoObjeto] || 1;
      if (objeto.setAlpha) objeto.setAlpha(Math.max(0.2, objeto.puntosRestantes / maximo));
    }
  }

  recolectarObjeto(jugador, objeto) {
    const tipo = objeto.tipoObjeto;
    const ganancia = objeto.puntosRestantes || this.puntajesObjetos[tipo] || 0;
    objeto.destroy();
    this.recolectados.push(tipo);
    this.conteos[tipo] += 1;
    this.puntaje += ganancia;
    this.actualizarTextoEstado();
    this.actualizarTextoPuntaje();
    this.comprobarVictoria();
  }

  actualizarTextoEstado() {
    this.textoEstado.setText(
      `Objetos: ${this.conteos.square} / ${this.conteos.triangle} / ${this.conteos.diamond} / ${this.conteos.skull}`
    );
  }

  actualizarTextoPuntaje() {
    this.textoPuntaje.setText(`Puntaje: ${this.puntaje}`);
  }

  comprobarVictoria() {
    if (this.puntaje > 100) {
      this.terminarJuego(true);
    }
  }

  terminarJuego(gano) {
    if (this.finDelJuego) {
      return;
    }

    this.finDelJuego = true;
    this.physics.pause();
    this.time.removeAllEvents();

    if (gano) {
      this.scene.start("game-win", {
        puntaje: this.puntaje,
      });
    } else {
      this.scene.start("game-over", {
        gano,
        puntaje: this.puntaje,
      });
    }
  }
}
