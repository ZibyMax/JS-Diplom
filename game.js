'use strict';

class Vector {
    constructor (x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    plus (vector){
        if (!(vector instanceof Vector)){
            throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    times (multiplier){
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}

class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
            throw new Error('Аргументы для создания объекта Actor должны быть типа Vector');
        }
        this.pos = pos;
        this.size = size;
        this.speed = speed;
    }

    get left() {
        return this.pos.x;
    }

    get right() {
        return this.pos.x + this.size.x;
    }

    get top() {
        return this.pos.y;
    }

    get bottom() {
        return this.pos.y + this.size.y;
    }

    get type() {
        return 'actor';
    }

    act(){}

    isIntersect(checkActor){
        if (!(checkActor instanceof Actor)) {
            throw new Error('Аргумент функции isIntersect должны быть типа Actor');
        }
        if (this === checkActor) {
            return false;
        }
        return ((this.right > checkActor.left) && (this.left < checkActor.right) &&
            (this.bottom > checkActor.top) && (this.top < checkActor.bottom));
    }
}

class Level {
    constructor(grid = [], actors = []){
        this.grid = grid;
        this.actors = actors;
        this.player = this.actors.find(actor => { return actor.type === 'player' });
        this.height = this.grid.length;
        this.width = this.height !== 0 ? Math.max(...this.grid.map(row => { return row.length })) : 0;
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {
        return this.status !== null && this.finishDelay < 0;
    }

    actorAt(checkActor) {
        if (!(checkActor instanceof Actor)){
            throw new Error('Аргумент функции actorAt должны быть типа Actor');
        }
        const actor = this.actors.find(actor => { return checkActor.isIntersect(actor) && actor !== checkActor });
        return actor ? actor : undefined;
    }

    obstacleAt(destination, size){
        if (!(destination instanceof Vector) || !(size instanceof Vector)){
            throw new Error('Аргументы функции obstacleAt должны быть типа Actor');
        }
        const leftBorder = Math.floor(destination.x);
        const rightBorder = Math.ceil(destination.x + size.x);
        const topBorder = Math.floor(destination.y);
        const bottomBorder = Math.ceil(destination.y + size.y);
        if (bottomBorder > this.height) {
            return 'lava';
        }
        if (leftBorder < 0 || rightBorder > this.width || topBorder < 0 ) {
                return 'wall';
            }
        for (let y = topBorder; y < bottomBorder; y++){
            for (let x = leftBorder; x < rightBorder; x++){
                if (this.grid[y][x] !== undefined) {
                    return this.grid[y][x];
                }
            }
        }
        return undefined;
    }

    removeActor(deletedActor){
        const index = this.actors.indexOf(deletedActor);
        if (index !== -1) {
            this.actors.splice(index, 1);
        }
    }

    noMoreActors(type){
        return !(this.actors.find(actor => { return actor.type === type}));
    }

    playerTouched(objectName, objectActor) {
        if (this.status === null) {
            if((objectName === 'lava') || (objectName === 'fireball')) {
                this.status = 'lost';
            } else if (objectName === 'coin') {
                this.removeActor(objectActor);
                if (this.noMoreActors('coin')){
                    this.status = 'won';
                }
            }
        }
    }
}

// ---------------------------------------------------------------------

const grid = [
    [undefined, undefined, undefined]
];

function MyCoin(title) {
    this.type = 'coin';
    this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
    console.log('Все монеты собраны');
    console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(0, 4), player.size);
if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
}

/*
const position = new Vector(0, 0);
const size = new Vector(0, 1);
console.log(level.height);
console.log(level.obstacleAt(position, size));
*/