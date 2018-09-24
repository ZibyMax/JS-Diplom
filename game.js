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
        return !(this.actors.find(actor => { return actor.type === type }));
    }

    playerTouched(objectName, objectActor) {
        if (this.status !== null) return;
        if ((objectName === 'lava') || (objectName === 'fireball')) {
            this.status = 'lost';
        }
        if (objectName === 'coin') {
            this.removeActor(objectActor);
            if (this.noMoreActors('coin')){
                this.status = 'won';
                }
            }
    }
}

class LevelParser{
    constructor(map){
        //this.map = new Map(map); - так то почему не работает?
        this.map = Object.assign({}, map);
    }

    actorFromSymbol(symbol){
        return this.map[symbol];
    }

    obstacleFromSymbol(symbol){
        if (symbol === 'x') return 'wall';
        if (symbol === '!') return 'lava';
        return undefined; // -> можно ли убрать эту строку?
    }

    createGrid(lines){
        const grid = [];
        lines.forEach(line => {
            grid.push(line.split('').map(item => {return this.obstacleFromSymbol(item)}));
        });
        return grid;
    }

    createActors(lines) {
        const actors = [];
        if (!lines) return actors;
        lines.forEach((line, y) => {
            let row = line.split('');
            row.forEach((symbol, x) => {
                const constructor = this.actorFromSymbol(symbol);
                if (typeof constructor === 'function') {
                    const actor = new constructor(new Vector(x, y));
                    if (actor instanceof Actor) {
                        actors.push(actor);
                    }
                }
            });
        });
        return actors;
    }

    parse(lines) {
        const grid = this.createGrid(lines);
        const actors = this.createActors(lines);
        return new Level(grid, actors);
    }
}





































