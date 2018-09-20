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

            Object.defineProperty(this, 'left', {
                get: function() {
                    return this.pos.x;
                }
            });

            Object.defineProperty(this, 'right', {
                get: function() {
                    return this.pos.x + this.size.x;
                }
            });

            Object.defineProperty(this, 'top', {
                get: function() {
                    return this.pos.y;
                }
            });

            Object.defineProperty(this, 'bottom', {
                get: function() {
                    return this.pos.y + this.size.y;
                }
            });

            Object.defineProperty(this, 'type', {
                writable: false,
                value: 'actor'
            });
        } else {
            throw new Error('Аргументы для создания объекта Actor должны быть типа Vector');
        }

    }

    isIntersect(checkActor){
        if (checkActor instanceof Actor){
            return this !== checkActor ?((this.right > checkActor.left) && (this.left < checkActor.right) &&
                (this.bottom > checkActor.top) && (this.top < checkActor.bottom)) : false;
        } else {
            throw new Error('Аргумент функции isIntersect должн быть типа Actor');
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
            throw new Error('Аргумент функции actorAt должн быть типа Actor');
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
            throw new Error('Аргумент функции actorAt должн быть типа Actor');
        } else {
            // ------------------------------------------------------------
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
        if (this.status !== null) {
            if(objectName === 'lava' || objectName === 'fireball') {
                this.status = 'lost';
            } else if (objectName === 'coin' && objectActor instanceof Actor) {
                this.removeActor(objectActor);
                if (this.noMoreActors('coin')){
                    this.status = 'won';
                }
            }
        }
    }

}

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

console.log(goldCoin);
console.log(bronzeCoin);
console.log(player);
console.log(fireball);
console.log(level);

/*
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
*/

























