// Base scene for the next step of the game.
// It adds falling collectible items and a simple win condition.

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  init() {
    this.player = null;
    this.cursors = null;
    this.items = null;
    this.platforms = null;
    this.collected = [];
    this.counts = { square: 0, triangle: 0, diamond: 0, skull: 0 };
    this.score = 0;
    this.itemScores = { square: 5, triangle: 8, diamond: 12, skull: -5 };
    this.statusText = null;
    this.scoreText = null;
    this.timerText = null;
    this.remainingTime = 25;
    this.gameOver = false;
  }

  preload() {
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600);
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    const ground = this.add.rectangle(400, 560, 800, 80, 0x4e9f3d);
    this.physics.add.existing(ground, true);

    const platformData = [
      { x: 100, y: 430, width: 160, height: 24 },
      { x: 700, y: 430, width: 160, height: 24 },
    ];
    this.platforms = platformData.map((platform) => {
      const platformRect = this.add.rectangle(
        platform.x,
        platform.y,
        platform.width,
        platform.height,
        0x4e9f3d
      );
      this.physics.add.existing(platformRect, true);
      return platformRect;
    });

    this.player = this.add.rectangle(400, 480, 48, 64, 0xe63946);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setBounce(0.1);
    this.player.body.setGravityY(600);

    this.physics.add.collider(this.player, ground);
    this.platforms.forEach((platform) => {
      this.physics.add.collider(this.player, platform);
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.items = this.physics.add.group();
    this.physics.add.collider(this.items, ground, this.onItemGroundCollision, null, this);
    this.platforms.forEach((platform) => {
      this.physics.add.collider(this.items, platform, this.onItemGroundCollision, null, this);
    });
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    this.statusText = this.add.text(16, 16, "Items: 0 / 0 / 0 / 0", {
      fontSize: "20px",
      fill: "#ffffff",
    });

    this.scoreText = this.add.text(16, 44, "Puntaje: 0", {
      fontSize: "20px",
      fill: "#00ffff",
    });

    this.timerText = this.add.text(16, 72, `Tiempo: ${this.remainingTime}`, {
      fontSize: "20px",
      fill: "#ffcc00",
    });

    this.add.text(16, 100, "Supera 100 puntos para ganar", {
      fontSize: "18px",
      fill: "#d7227a",
    });

    this.time.addEvent({
      delay: 500,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 1000,
      callback: this.decreaseTimer,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.gameOver) {
      this.player.body.setVelocityX(0);
      return;
    }

    const speed = 350;
    const jumpSpeed = -420;

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    } else {
      this.player.body.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.body.setVelocityY(jumpSpeed);
    }
  }

  decreaseTimer() {
    if (this.gameOver) {
      return;
    }

    this.remainingTime -= 1;
    this.timerText.setText(`Tiempo: ${this.remainingTime}`);

    if (this.remainingTime <= 0) {
      this.endGame(false);
    }
  }

  spawnItem() {
    const types = ["square", "triangle", "diamond", "skull"];
    const type = Phaser.Utils.Array.GetRandom(types);
    const x = Phaser.Math.Between(50, 750);
    const y = -20;

    let item;
    if (type === "square") {
      item = this.add.rectangle(x, y, 36, 36, 0xffcc00);
    } else if (type === "triangle") {
      item = this.add.triangle(x, y, 0, 36, 18, 0, 36, 36, 0x4bcffa);
    } else if (type === "diamond") {
      item = this.add.polygon(x, y, [0, 18, 18, 0, 36, 18, 18, 36], 0xff6b6b);
    } else {
      item = this.add.circle(x, y, 18, 0x9b5de5);
    }

    this.physics.add.existing(item);
    
    item.remainingPoints = this.itemScores[type] || 0;
    item.isPenalty = type === "skull";
    item.groundBounces = 0;
    item.body.setCollideWorldBounds(true);
    item.body.setGravityY(200);
    item.itemType = type;
    item.body.setSize(item.width, item.height, true);

    this.items.add(item);
    item.body.setBounce(0.6);
  }

  onItemGroundCollision(objA, objB) {
    if (this.gameOver) return;

    const findItem = (a, b) => {
      const candidates = [a, b];
      for (const o of candidates) {
        if (!o) continue;
        if (o.itemType && (o.itemType === 'square' || o.itemType === 'triangle' || o.itemType === 'diamond')) return o;
        if (o.body && o.body.gameObject && o.body.gameObject.itemType) return o.body.gameObject;
        if (o.gameObject && o.gameObject.itemType) return o.gameObject;
      }
      return null;
    };

    const item = findItem(objA, objB);
    if (!item || !item.body) return;

    if (typeof item.remainingPoints === 'undefined') {
      item.remainingPoints = this.itemScores[item.itemType] || 0;
    }

    const now = this.time.now;
    if (item.lastGroundHit && now - item.lastGroundHit < 200) {
      return;
    }
    item.lastGroundHit = now;

    if (item.isPenalty) {
      if (item.groundBounces >= 1) {
        item.destroy();
      } else {
        item.groundBounces += 1;
      }
      return;
    }

    item.remainingPoints -= 5;
    if (item.remainingPoints <= 0) {
      item.destroy();
    } else {
      const max = this.itemScores[item.itemType] || 1;
      if (item.setAlpha) item.setAlpha(Math.max(0.2, item.remainingPoints / max));
    }
  }

  collectItem(player, item) {
    const type = item.itemType;
    const earned = item.remainingPoints || this.itemScores[type] || 0;
    item.destroy();
    this.collected.push(type);
    this.counts[type] += 1;
    this.score += earned;
    this.updateStatusText();
    this.updateScoreText();
    this.checkWinCondition();
  }

  updateStatusText() {
    this.statusText.setText(
      `Items: ${this.counts.square} / ${this.counts.triangle} / ${this.counts.diamond} / ${this.counts.skull}`
    );
  }

  updateScoreText() {
    this.scoreText.setText(`Puntaje: ${this.score}`);
  }

  checkWinCondition() {
    if (this.score > 100) {
      this.endGame(true);
    }
  }

  endGame(won) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    const message = won ? "GANASTE!" : "PERDISTE";
    const color = won ? "#00ff00" : "#ff0000";

    this.add.text(300, 300, message, {
      fontSize: "48px",
      fill: color,
    });

    this.physics.pause();
    this.time.removeAllEvents();
  }
}
