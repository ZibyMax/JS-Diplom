'use strict';

class Vector {
    constructor (x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    plus (vector){
        if (vector instanceof Vector){
            return new Vector(this.x + vector.x, this.y + vector.y);
        } else {
            throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        }
    }

    times (multiplier){
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}

class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if (pos instanceof Vector && size instanceof Vector && speed instanceof Vector){
            this.pos = pos;
            this.size = size;
            this.speed = speed;

            Object.defineProperty(this, 'act', {
                writable: true,
                value: function(){}
            });
        } else {
            throw new Error('Аргументы для создания объекта Actor должны быть типа Vector');
        }
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
    isIntersect(checkActor){
        if (checkActor instanceof Actor){
            return this !== checkActor ?((this.right > checkActor.left) && (this.left < checkActor.right) &&
                (this.bottom > checkActor.top) && (this.top < checkActor.bottom)) : false;
        } else {
            throw new Error('Аргумент функции isIntersect должны быть типа Actor');
        }
    }
}

class Level {
    constructor(grid = [], actors = []){
        this.grid = grid;
        this.actors = actors;

        this.player = this.actors.find(actor => { return actor.type === 'player' });

        this.height = this.grid.length;
        this.width = this.height !== 0 ? Math.max.apply(null, this.grid.map(
            function(gridRow){ return gridRow.length })) : 0;
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {
        return this.status !== null && this.finishDelay < 0;
    }

    actorAt(checkActor) {
        if (!(checkActor instanceof Actor)){
            throw new Error('Аргумент функции actorAt должны быть типа Actor');
        } else {
            for (let actor of this.actors){
                if (checkActor.isIntersect(actor) && checkActor !== actor) {
                    return actor;
                }
            }
            return undefined;
        }
    }

    obstacleAt(destination, size){
        if (!(destination instanceof Vector) || !(size instanceof Vector)){
            throw new Error('Аргументы функции obstacleAt должны быть типа Actor');
        } else {
            let leftBorder = Math.floor(destination.x);
            let rightBorder = Math.ceil(destination.x + size.x);
            let topBorder = Math.floor(destination.y);
            let bottomBorder = Math.ceil(destination.y + size.y);

            if (bottomBorder >= this.height) {
                return 'lava';
            } else if (leftBorder < 0 || rightBorder > this.width || topBorder < 0 ) {
                return 'wall';
            } else {
                return undefined;
            }
        }
    }

    removeActor(deletedActor){
            let index = this.actors.indexOf(deletedActor);
            if (index !== -1) {
                this.actors.splice(index, 1);
            }
    }

    noMoreActors(type){
        for (let actor of this.actors){
            if (actor.type === type){
                return false;
            }
        }
        return true;
    }

    playerTouched(objectName, objectActor = undefined) {
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
    [undefined, undefined],
    ['wall', 'wall']
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

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
}

const position = new Vector(0, 0);
const size = new Vector(0, 0);
console.log(level.obstacleAt(position, size));