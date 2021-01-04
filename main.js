"use strict";

// create map
// map size x, y
let map = {
  // element with what map is related to
  elem: document.querySelector('#root'),
  size: {
    x: 8,
    y: 15,
  },
  cells: [],
  // generating 2d map given this.size properties
  generate: function() {
    for (let i = 0; i < this.size.y; i++) {
      map.cells[i] = new Array(this.size.x);
    };
    for (let row = 0; row < this.size.y; row++) {
      // creating new .row div
      let rowElem = document.createElement('div');
      rowElem.classList.add('row');
      this.elem.appendChild(rowElem);
      for (let cell = 0; cell < this.size.x; cell++) {
        // creating new cell element
        let cellElem = document.createElement('div');
        cellElem.innerHTML = `${cell},${row}`;
        this.elem.children[row].appendChild(cellElem);
      };
    };
  },
  // color all blocks to white
  clear: function() {
    for (let row = 0; row < map.size.y; row++) {
      for (let cell = 0; cell < map.size.x; cell++) {
        this.getCell(row, cell).style.background = '';
      };
    };
  },
  display: function() {
    for (let row = 0; row < this.size.y; row++) {
      for (let cell = 0; cell < this.size.x; cell++) {
        if (this.cells[row][cell] != undefined) {
          this.getCell(row, cell).style.background = this.cells[row][cell];
        };
      };
    };
  },
  // check for destroyable rows
  // rowCheck 1 - complete row (destroy)
  // rowCheck 0 - incomplete row (do not destroy)
  destroyCheck: function () {
    for (let row = 0; row < map.size.y; row++) {
      let rowCheck = 1;
      for (let cell = 0; cell < map.size.x; cell++) {
        if ( this.getCell(row, cell).style.background === '' ) {
          rowCheck = 0;
        };
      };
      if (rowCheck) {
        console.log(`Destroying row: ${row}`);
        this.destroyRow(row);
      };
    };
  },
  destroyRow: function (rowNum) {
    // rowNum--;
    for (rowNum; rowNum > 0; rowNum--) {
      for (let cell = 0; cell < map.size.x; cell++) {
        this.cells[rowNum][cell] = this.cells[rowNum - 1][cell];
        // this.cells[rowNum][cell] = undefined;
      };
    };
    renderer();
  },
  getCell: function (row = 0, cell = 0) {
    return this.elem.children[row].children[cell]
  }
};
map.generate();

// generate figures
let figureColor = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF'];
// figure is array of all figures that exist 
let figureProtos = 
[
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
  ],
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]
];

// block that you controll at the moment
let controlBlock = {
  defaultPosition: {
    x: 1, y: 0
  },
  position: {
    x: 0, y: 0
  },
  // resets this.position to this.defaultPosition
  resetPos: function () {
    let pos = Object.assign ( {}, this.defaultPosition );
    this.position = pos;
  },
  // returns controlBlock position as new obj
  getPos: function () {
    return Object.assign ( {}, this.position)
  },
  color: '#000000',
  figure: [],
  // cells is an array of objects with x and y properties
  // cells are being generated automatically with generate function (figureId)
  cells: [],
  getCells: function () {
    return JSON.parse(JSON.stringify(this.cells))
  },
  // generage block based of figure array
  // can generate specific figure if needed
  generate: function ( 
    figId = Math.round ( Math.random () * ( figureProtos.length - 1 ) ),
    figColor = Math.round ( Math.random () * ( figureColor.length - 1 ) )
  ) {
    this.resetPos();
    this.cells = figureProtos[figId];
    this.color = figureColor[figColor];
  },
  display: function() {
    let cellArr = this.cellPositions();
    cellArr.forEach (elem => {
      map.elem.children[elem.y].children[elem.x].style.background = this.color;
    });
  },
  // calculates this.cells positions relative to given position (default is this.position) and given cells (default is this.cells)
  cellPositions: function (pos = this.position, cellArr = JSON.parse(JSON.stringify(this.cells))) {
    // because copying array of objects doesn't work properly
    cellArr.forEach ( cell => {
      cell.x += pos.x;
      cell.y += pos.y;
    });
    return cellArr
  },
  // direction
  // 1 - top
  // 2 - left
  // 3 - bottom
  // 4 - right
  move: function (direction) {
    let newPos = this.getPos();
    switch (direction) {
      case 1: newPos.y--; break;
      case 2: newPos.x++; break;
      case 3: newPos.y++; break;
      case 4: newPos.x--; break;
    };
    // array of cells with new position
    // later used to ckeck for ability to change position
    let cellArr = this.cellPositions(newPos);
    // check for ability to change position
    let movable = this.positionCheck(cellArr);
    if (movable === 1) {
      controlBlock.position = newPos;
      renderer();
    };
  },
  autoMove: function() {
    let newPos = this.getPos();
    newPos.y++;
    let cellArr = this.cellPositions(newPos);
    let movable = this.positionCheck(cellArr);
    if (movable === 1) {
      controlBlock.position = newPos;
    }else {
      this.drop();
    };
    renderer();
  },
  // checks for position of given array of object position
  // 1 in bounds, movable (all cells)
  // 0 out of bounds or overlaps with other cell. Non movable (at least one cell)
  positionCheck: function(cellArr) {
    let movable = 1;
    cellArr.forEach (cell => {
      if 
        (
          (cell.x < 0 || cell.x > map.size.x - 1) || 
          (cell.y < 0 || cell.y > map.size.y - 1)
        ) {
          console.log(`${cell.x}, ${cell.y}: Out of bounds`);
          movable = 0;
        }else {
          if (map.cells[cell.y][cell.x] != undefined) {
            console.log(`${cell.x}, ${cell.y}: Overlaps with other cell`);
            movable = 0;
          };
        };
    });
    return movable;
  },
  rotate: function() {
    // first we get cell positions relative to this.position ( this.getCells() )
    // then we create new array to rotate -90deg those cells
    // new x = -y
    // new y = x
    // we check if those cells fit on map this.positionCheck ( this.cellPositions (this.position, JSON.parse(JSON.stringify(array))))
    let cellArr = this.getCells();
    let cellCopyArr = this.getCells();
    // console.log(cellArr);
    // debugger;
    cellCopyArr.forEach ( (cell, i) => {
      cellArr[i].x = -cell.y;
      cellArr[i].y = cell.x;
    });
    // console.log(cellArr);
    // debugger;
    let movable = this.positionCheck ( this.cellPositions ( this.position, JSON.parse( JSON.stringify ( cellArr ) ) ) );
    if (movable === 1) {
      controlBlock.cells = cellArr;
    };
    renderer();
  },
  drop: function() {
    let cellArr = this.cellPositions();
    cellArr.forEach (cell => {
      map.cells[cell.y][cell.x] = this.color;
    });
    map.destroyCheck();
    this.generate();
  }
};
controlBlock.generate();
controlBlock.display();

// this exists only for visual displaying of blocks on map
let renderer = function() {
  map.clear();
  map.display();
  controlBlock.display();
};

// adding event listeners

let boost = false;
addEventListener('keydown', e => {
  // boost - pressed (true) or not pressed (false)
  if (e.keyCode == 40 || e.keyCode == 83) {
    boost = true;
    // console.log('Boost');
  };

  // rotation of blocks
  if (e.keyCode == 87 || e.keyCode == 38) {
    // check if block can be rotated
    // if can be. then rotate
    console.log('rotate');
    controlBlock.rotate();
  };

  // moving block left/right
  if (e.keyCode == 65 || e.keyCode == 37) {
    // check if can be moved left
    // if can be. then move
    controlBlock.move(4);
  };
  if (e.keyCode == 68 || e.keyCode == 39) {
    // check if can be moved right
    // if can be. then move
    controlBlock.move(2);
  };

});
addEventListener('keyup', e => {
  if (e.keyCode == 40 || e.keyCode == 83) {
    boost = false;
    // console.log('Boost ended');
  };
});

// time func
let gameSpeed = 100 // in ms

// just iterating function to keep track of time and falling blocks
let timeCounter = 0;
let timeFunc = () => {
  // boost (boolean) is a var accounting for user pressing keyDown on some key to speed up game
  if (!boost) {
    timeCounter++;
  }else {
    timeCounter += 10;
  };
  if(timeCounter >= gameSpeed) {
    timeCounter -= gameSpeed;
    // update falling block position
    controlBlock.autoMove();
    renderer();
  };
};

var gameIteration;
// game start function 
let gameInit = () => {
  console.log('Starting game');
  document.querySelector('.btn').disabled = true;
  // add event listeners
  // setting interval to renderer func
  gameIteration = setInterval(timeFunc, 1);

  // create first block
  // controlBlock.generate();

  // display game on html
  renderer();
};

let stopGame = () => {
  clearInterval(gameIteration);
  console.log('Stoped the game!');
  document.querySelector('.btn').disabled = false;
};
// gameInit();