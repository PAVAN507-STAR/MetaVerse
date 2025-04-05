import { Scene } from "phaser";

export class room1 extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private table!: Phaser.Physics.Arcade.StaticImage;
    private chairs: Phaser.GameObjects.Image[] = [];
    private sitKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super('room1');
    }

    preload() {
        this.load.image('floor-tile', '/assets/tile.png');
        for (let i = 0; i < 16; i++) {
            this.load.image(`frame${i}`, `/assets/${i + 1}.png`);
        }
        this.load.image('table', '/assets/table2.png');
        this.load.image('chair-top', '/assets/chair1.png');   // horizontal chair for north and south
        this.load.image('chair-left', '/assets/chair2.png');    // vertical chair for west and east
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Add floor background
        this.add.tileSprite(width / 2, height / 2, width, height, 'floor-tile');

        // Create table (with physics collision) at the center of the scene
        this.table = this.physics.add.staticImage(width / 2, height / 2, 'table');
        this.table.setScale(1.2).refreshBody();

        // Get table bounds to determine chair positions
        const bounds = this.table.getBounds();
        const offset = 20; // margin from table edge

        // North (top) chair using chair-top
        const chairNorth = this.add.image(this.table.x, bounds.top - offset, 'chair-top').setScale(1.2);
        // South (bottom) chair using chair-top
        const chairSouth = this.add.image(this.table.x, bounds.bottom + offset, 'chair-top').setScale(1.2);
        // West (left) chair using chair-left
        const chairWest = this.add.image(bounds.left - offset, this.table.y, 'chair-left').setScale(1.2);
        // East (right) chair using chair-left, flipped horizontally so it faces inward
        const chairEast = this.add.image(bounds.right + offset, this.table.y, 'chair-left').setScale(1.2);

        // Store chairs in an array for sitting logic
        this.chairs.push(chairNorth, chairSouth, chairWest, chairEast);

        // Add player
        this.player = this.physics.add.sprite(100, 450, "frame0");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        // Only table has collision (chairs are non-colliding)
        this.physics.add.collider(this.player, this.table);

        // Animations
        this.anims.create({
            key: "left-walk",
            frames: [{ key: 'frame8' }, { key: 'frame9' }, { key: 'frame10' }, { key: 'frame11' }],
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "right-walk",
            frames: [{ key: 'frame4' }, { key: 'frame5' }, { key: 'frame6' }, { key: 'frame7' }],
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "up-walk",
            frames: [{ key: 'frame12' }, { key: 'frame13' }, { key: 'frame14' }, { key: 'frame15' }],
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "down-walk",
            frames: [{ key: 'frame0' }, { key: 'frame1' }, { key: 'frame2' }, { key: 'frame3' }],
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "idle",
            frames: [{ key: 'frame0' }],
            frameRate: 1
        });

        // Input keys
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.sitKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    }

    update() {
        if (!this.cursors) return;

        // Set a threshold distance from the table center to decide if the player is in the seating area.
        const tableHighlightDistance = 150;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.table.x, this.table.y);

        // Highlight (tint) the table when the player is close enough.
        if (distance < tableHighlightDistance) {
            this.table.setTint(0xffffaa);
        } else {
            this.table.clearTint();
        }

        // When in the seating area and X is pressed, find the nearest chair and "sit" there.
        if (distance < tableHighlightDistance && Phaser.Input.Keyboard.JustDown(this.sitKey)) {
            let nearestChair = this.chairs[0];
            let minDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, nearestChair.x, nearestChair.y);
            for (const chair of this.chairs) {
                const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, chair.x, chair.y);
                if (d < minDist) {
                    minDist = d;
                    nearestChair = chair;
                }
            }
            // Move player to the chair position (adjust Y offset if needed)
            this.player.setVelocity(0, 0);
            this.player.setX(nearestChair.x);
            this.player.setY(nearestChair.y - 10);
            this.player.anims.play('idle', true);
            return;
        }

        // Movement logic
        const speed = 480;
        const velocityX = this.cursors.left?.isDown ? -speed : this.cursors.right?.isDown ? speed : 0;
        const velocityY = this.cursors.up?.isDown ? -speed : this.cursors.down?.isDown ? speed : 0;
        this.player.setVelocity(velocityX, velocityY);

        if (velocityX < 0) {
            this.player.anims.play('left-walk', true);
        } else if (velocityX > 0) {
            this.player.anims.play('right-walk', true);
        } else if (velocityY < 0) {
            this.player.anims.play('up-walk', true);
        } else if (velocityY > 0) {
            this.player.anims.play('down-walk', true);
        } else {
            this.player.anims.play('idle', true);
        }
    }
}
