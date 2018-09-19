'use strict';


class Vector{
    constructor (x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    plus (vector){
        try{
            if (vector instanceof Vector){
                return new Vector(this.x + vector.x, this.y + vector.y);
            } else {
                throw 'Можно прибавлять к вектору только вектор типа Vector';
            }
        } catch (error) {
            console.error(error);
        }
    }

    times (multiplier){
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}


class Actor{
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        try{
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
                throw 'Аргументы для создания объекта Actor должны быть типа Vector';
            }
        } catch (error) {
            console.error(error);
        }
    }

    isIntersect(another){
        try{
            if (another instanceof Actor){
                return this !== another ?((this.right > another.left) && (this.left < another.right) &&
                    (this.top > another.bottom) && (this.bottom < another.top)) : false;
            } else {
                throw 'Аргумент функции isIntersect должн быть только типа Actor';
            }
        } catch (error) {
            console.error(error);
        }

    }
}


const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
    return ['left', 'top', 'right', 'bottom']
        .map(side => `${side}: ${item[side]}`)
        .join(', ');
}

function movePlayer(x, y) {
    player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
    console.log(`${title}: ${position(item)}`);
    if (player.isIntersect(item)) {
        console.log(`Игрок подобрал ${title}`);
    }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
//movePlayer(5, -5);
//items.forEach(status);

items.forEach((value, key) => {console.log(key);console.log(value);console.log(player.isIntersect(value))});