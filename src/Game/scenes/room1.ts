import { Scene } from "phaser";
export class room1 extends Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private table!: Phaser.Physics.Arcade.StaticImage;
    private currentDirection: string = 'down';
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
        this.input.addPointer(1);
        this.load.image('table', '/assets/table2.png');
        this.load.image('chair-top', '/assets/chair1.png');
        this.load.image('chair-left', '/assets/chair2.png');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.tileSprite(width / 2, height / 2, width, height, 'floor-tile');

        this.table = this.physics.add.staticImage(width / 2, height / 2, 'table');
        this.table.setScale(1.2).refreshBody();

        const bounds = this.table.getBounds();
        const offset = 20;

        const chairNorth = this.add.image(this.table.x, bounds.top - offset, 'chair-top').setScale(1.2);
        chairNorth.setData('facing', 'south');
        const chairSouth = this.add.image(this.table.x, bounds.bottom + offset, 'chair-top').setScale(1.2);
        chairSouth.setData('facing', 'north');
        const chairWest = this.add.image(bounds.left - offset, this.table.y, 'chair-left').setScale(1.2);
        chairWest.setData('facing', 'right');
        const chairEast = this.add.image(bounds.right + offset, this.table.y, 'chair-left').setScale(1.2);
        chairEast.setData('facing', 'left');

        this.chairs.push(chairNorth, chairSouth, chairWest, chairEast);

        this.player = this.physics.add.sprite(100, 450, "frame0");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.table);

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
            key: "front-idle",
            frames: [{ key: 'frame0' }],
            frameRate: 1
        });
        this.anims.create({
            key: "left-idle",
            frames: [{ key: 'frame8' }],
            frameRate: 20,
            repeat: -1,
        });
        this.anims.create({
            key: "right-idle",
            frames: [{ key: 'frame4' }],
            frameRate: 20,
            repeat: -1,
        });
        this.anims.create({
            key: "down-idle",
            frames: [{ key: 'frame14' }],
            frameRate: 20,
            repeat: -1,
        });
        
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.sitKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    }

    update() {
        if (!this.cursors) return;
    
        const speed = 640;
        const right = this.cursors.right.isDown;
        const left = this.cursors.left.isDown;
        const up = this.cursors.up.isDown;
        const down = this.cursors.down.isDown;
    
        const velocityX = left && !up && !down ? -speed : right && !up && !down ? speed : 0;
        const velocityY = up && !left && !right ? -speed : down && !left && !right ? speed : 0;
        this.player.setVelocity(velocityX, velocityY);
    
        if (velocityX < 0) {
            this.player.anims.play('left-walk', true);
            this.currentDirection = 'left';
        } else if (velocityX > 0) {
            this.player.anims.play('right-walk', true);
            this.currentDirection = 'right';
        } else if (velocityY < 0) {
            this.player.anims.play('up-walk', true);
            this.currentDirection = 'up';
        } else if (velocityY > 0) {
            this.player.anims.play('down-walk', true);
            this.currentDirection = 'down';
        } else {
            if (this.currentDirection === 'left') {
                this.player.anims.play('left-idle', true);
            } else if (this.currentDirection === 'right') {
                this.player.anims.play('right-idle', true);
            } else if (this.currentDirection === 'down') {
                this.player.anims.play('front-idle', true);
            } else if (this.currentDirection === 'up') {
                this.player.anims.play('down-idle', true);
            }
        }
    
        const tableHighlightDistance = 150;
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.table.x, this.table.y);
    
        if (distance < tableHighlightDistance) {
            this.table.setTint(0xffffff);
        } else {
            this.table.clearTint();
        }
    
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
            this.player.setVelocity(0, 0);
            const facing = nearestChair.getData('facing');
            const tableBounds = this.table.getBounds();
            const playerHalfWidth = this.player.displayWidth / 2;
            const playerHalfHeight = this.player.displayHeight / 2;
            this.currentDirection = facing;
            if (facing === 'left') {
                this.player.setX(tableBounds.right + playerHalfWidth);
                this.player.setY(nearestChair.y);
                this.player.anims.play('left-idle', true);
            } else if (facing === 'right') {
                this.player.setX(tableBounds.left - playerHalfWidth);
                this.player.setY(nearestChair.y);
                this.player.anims.play('right-idle', true);
            } else if (facing === 'north') {
                this.player.setY(tableBounds.bottom + playerHalfHeight);
                this.player.setX(nearestChair.x);
                this.player.anims.play('down-idle', true);
            } else if (facing === 'south') {
                this.player.setY(tableBounds.top - playerHalfHeight);
                this.player.setX(nearestChair.x);
                this.player.anims.play('front-idle', true);
            }
            return;
        }
    }
}