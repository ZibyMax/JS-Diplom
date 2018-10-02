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
        // Игорь, ниже вы пишете что скобки лучше добавить, а не убрать (Level.playerTouched)
        if (this === checkActor) {
            return false;
        }
        return (this.right > checkActor.left && this.left < checkActor.right &&
            this.bottom > checkActor.top && this.top < checkActor.bottom);
    }
}

class Level {
    constructor(grid = [], actors = []){
        this.grid = grid;
        this.actors = actors;
        // тут можно использовать сокращённую форму записи стрелочной функции -----> ? так она и так сокращенная, куда больше
        this.player = this.actors.find(actor => { return actor.type === 'player' });
        this.height = this.grid.length;
        // если добавить в список аргументов Math.max 0, то проверку можно будет убрать -----> а?
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
        const actor = this.actors.find(actor => { return checkActor.isIntersect(actor) });
        return actor;
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
                // this.grid[y][x] лучше записатьв переменную, чтобы не писать 2 раза
                // -----> я не понял зачем это делать: чем this.grid[y][x] хуже?
                let posInGrid = this.grid[y][x];
                if (posInGrid !== undefined) {
                    return posInGrid;
                }
            }
        }
    }

    removeActor(deletedActor){
        const index = this.actors.indexOf(deletedActor);
        if (index !== -1) {
            this.actors.splice(index, 1);
        }
    }

    noMoreActors(type){
        return !(this.actors.some(actor => { return actor.type === type }));
        //return !(this.actors.find(actor => { return actor.type === type }));
        // -----> почему return нельзя убрать?
    }

    playerTouched(objectName, objectActor) {
        if (this.status !== null) {
            return;
        }
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
        this.map = Object.assign({}, map);
    }

    actorFromSymbol(symbol){
        return this.map[symbol];
    }

    obstacleFromSymbol(symbol){
        if (symbol === 'x') {
            return 'wall';
        }
        if (symbol === '!') {
            return 'lava';
        }
    }

    createGrid(lines){
        const grid = [];
        // можно записать короче, если использовать метод map 2 раза ----------------!!!!!!!!!!!!!!!!
        // там где возможно лучше использовать сокращённую форму записи стрелочных функций
        // (без фигурных скобок)
        lines.forEach(line => {
            grid.push(line.split('').map(item => {return this.obstacleFromSymbol(item)}));
        });
        return grid;
    }

    createActors(lines) {
        const actors = [];
        lines.forEach((line, y) => {
            const row = line.split('');
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

class Fireball extends Actor{
    constructor (pos = new Vector(0, 0), speed = new Vector(0, 0)){
        const size = new Vector(1, 1);
        super(pos, size, speed);
        // зачем defineProperty? -------------------------!!!!!!!!!!!!!!!
        Object.defineProperty(this, 'type', {
            value: 'fireball'
        });
    }

    getNextPosition(time = 1){
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle(){
        this.speed = this.speed.times(-1);
    }

    act(time, level){
        const nextPos = this.getNextPosition(time);
        if (level.obstacleAt(nextPos, this.size)) {
            this.handleObstacle();
        } else {
            this.pos = nextPos;
        }
    }
}

class HorizontalFireball extends Fireball{
    constructor(pos){
        const speed = new Vector(2, 0);
        super(pos, speed);
    }
}

class VerticalFireball extends Fireball{
    constructor(pos){
        const speed = new Vector(0, 2);
        super(pos, speed);
    }
}

class FireRain extends Fireball{
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.start = this.pos;
    }

    handleObstacle() {
        this.pos = this.start;
    }
}

class Coin extends Actor{
    constructor(pos = new Vector()){
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
        // defineProperty? --------------------------------------------------!!!!!!!!!!!!!!
        Object.defineProperty(this, 'type', {
            value: 'coin'
        });
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * Math.PI * 2;
        this.startPos = this.pos;
    }

    updateSpring(time = 1){
        this.spring += this.springSpeed * time;
    }

    getSpringVector(){
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1){
        this.updateSpring(time);
        const springVector = this.getSpringVector();
        return new Vector(this.startPos.x, this.startPos.y + springVector.y);
        //return new Vector(this.startPos.x, this.startPos.y + springVector.y);
    }

    act(time = 1){
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor{
    constructor(pos = new Vector()){
        super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
        // defineProperty? --------------------------------------------------!!!!!!!!!!!!!!
        Object.defineProperty(this, 'type', {
            value: 'player'
        });
    }
}

