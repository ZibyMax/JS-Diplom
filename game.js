'use strict';

class Vector {
    constructor (x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    plus (vector){
        // лучше сначала проверить аргументы, а потом писать основной код
        if (vector instanceof Vector){
            return new Vector(this.x + vector.x, this.y + vector.y);
        // после throw и return else можно не писать
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
        // лучше обратить условие, обработать ситуацию,
        // когда в аргументах некорректные значения,
        // а потом расположить основной код
        if (pos instanceof Vector && size instanceof Vector && speed instanceof Vector){
            this.pos = pos;
            this.size = size;
            this.speed = speed;

            // зачем defineProperty? Это же просто метод
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
            // разбейте это на несколько if,
            // иначе невозможно понять что тут происходит
            return this !== checkActor ?((this.right > checkActor.left) && (this.left < checkActor.right) &&
                (this.bottom > checkActor.top) && (this.top < checkActor.bottom)) : false;
        } else {
            // это лучше в начале
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
        // apply в ES6 иожно заменить спредом
        this.width = this.height !== 0 ? Math.max.apply(null, this.grid.map(
            // лучше использовать стрелочную функцию
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
        // else можно убрать
        } else {
            // есть специальный метод, для поиска в массиве
            for (let actor of this.actors){
                if (checkActor.isIntersect(actor) && checkActor !== actor) {
                    return actor;
                }
            }
            // лишняя строчка
            return undefined;
        }
    }

    obstacleAt(destination, size){
        if (!(destination instanceof Vector) || !(size instanceof Vector)){
            throw new Error('Аргументы функции obstacleAt должны быть типа Actor');
        // else можно убрать
        } else {
            // если значение присваивается переменной 1 раз,
            // то лушче использовать const
            let leftBorder = Math.floor(destination.x);
            let rightBorder = Math.ceil(destination.x + size.x);
            let topBorder = Math.floor(destination.y);
            let bottomBorder = Math.ceil(destination.y + size.y);

            if (bottomBorder >= this.height) {
                return 'lava';
            // else можно убрать
            } else if (leftBorder < 0 || rightBorder > this.width || topBorder < 0 ) {
                return 'wall';
            // else можно убрать
            } else {
                // тут нужно обойти ячейки, на которых находится объект,
                // если там что-то есть — вернуть
                return undefined;
            }
        }
    }

    removeActor(deletedActor){
            // const
            // форматировние
            let index = this.actors.indexOf(deletedActor);
            if (index !== -1) {
                this.actors.splice(index, 1);
            }
    }

    noMoreActors(type){
        // есть специальный метод для проверки начиля
        // объектов по условию
        for (let actor of this.actors){
            if (actor.type === type){
                return false;
            }
        }
        return true;
    }

    // некорректное значение по-умолчанию
    playerTouched(objectName, objectActor = undefined) {
        // лучше обратить условие, чтобы уменьшить вложенность
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
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, 'wall', undefined],
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

const obstacle = level.obstacleAt(new Vector(3, 1), player.size);
if (obstacle) {
    console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
    console.log('Пользователь столкнулся с шаровой молнией');
}

const position = new Vector(0, 0);
const size = new Vector(1, 1);
console.log(level.obstacleAt(position, size));