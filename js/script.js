var Cell = Object.create({
    x : 0,
    y : 0,
    mine : false,
    minesClose: 0,
    state : 'CLOSED',
    flagged : false,
    td : null,
    
    paint : function() {
        this.td = document.createElement("td");
        this.td.setAttribute('id', 'x' + this.x + ':' + 'y' + this.y);
        this.td.className = '';
        return this.td;
    }, 
    open : function() {
        if(this.state === 'CLOSED'){
            this.state = 'OPEN';
            if(this.mine){
                this.td.className = (this.td.className === '') ? 'mine' : ' mine';
            }else{
                this.td.className = (this.td.className === '') ? 'open' : ' open';
                this.showNumberOfNeigboursMines();
            }
        }
    },
    flag : function() {
        if(this.state === 'CLOSED'){
            this.state = 'FLAGGED';
            this.td.className = (this.td.className === '') ? 'flagged' : ' flagged';
            this.flagged = true;
        }else if(this.state === 'FLAGGED'){
            this.state = 'CLOSED';
            this.td.className = '';
            this.flagged = false;
        }
        return this.flagged;
    },
    showNumberOfNeigboursMines : function() {
        this.td.innerHTML = this.minesClose;
        return;
    }
});

var MineSweeper = Object.create({
    user : null,
    width : 8,
    height : 8,
    numberOfMines : 10,
    cells : [],
    gameOver : false,
    tdSize : 30,
    flags : 0,

    putMines : function() {
        var index;

        for (var i = 0; i < this.numberOfMines; i++) {

            index = getRandomArbitrary(0, this.cells.length - 1);

            if (!this.cells[index].mine) {
                this.cells[index].mine = true;
            } else {
                i--;
            }
        }

        function getRandomArbitrary(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    },
    paintMenu : function() {
        var body = document.getElementsByTagName("body")[0];
        var menu = document.createElement("div");
        menu.setAttribute('id', 'menu');
        
        var title = document.createElement("h1");
        title.innerHTML = 'Mine Sweeper';
        
        var user = document.createElement("div");
        user.setAttribute('id', 'user-name');
        //user.innerHTML = '';
        
        var numberOfMines = document.createElement("span");
        numberOfMines.setAttribute('id', 'number-of-mines');
        numberOfMines.innerHTML = '' + this.numberOfMines;
        
        var numberOfFlags = document.createElement("span");
        numberOfFlags.setAttribute('id', 'number-of-flags');
        numberOfFlags.innerHTML = this.flags;
        
        menu.appendChild(title);
        menu.appendChild(user);
        menu.appendChild(numberOfFlags);
        menu.innerHTML = menu.innerHTML + ' / ';
        menu.appendChild(numberOfMines);
        body.appendChild(menu);
        
    },
    paintTable : function() {
        var body = document.getElementsByTagName("body")[0];
        var table = document.createElement("table");
        var tableBody = document.createElement("tbody");

        var cell;

        for (var y = this.width - 1; y > -1; y--) {
            var row = document.createElement("tr");

            for (var x = 0; x < this.height; x++) {
                cell = Object.create(Cell);
                cell.x = x;
                cell.y = y;
                this.cells.push(cell);
                row.appendChild(cell.paint());
            }
            tableBody.appendChild(row);
        }

        table.appendChild(tableBody);
        body.appendChild(table);

        var sheet = document.createElement('style');
        sheet.innerHTML = "\
             body { font-family: sans; } \
             #menu { text-align: center; font-weight: bold; } \
             h1 { color: #666; } \
             table { margin: auto; font-family: sans-serif; font-weight: bold; } \
             td { background-color: #cbcbcb; width: " + this.tdSize + "px; height: " + this.tdSize + "px; border: 2px solid #fff; margin: 0px; padding: 2px; text-align: center; } \
             td.mine { background-color: tomato; } \
             td.flagged { background-color: skyblue; } \
             td.open { background-color: yellowgreen; }";
        document.body.appendChild(sheet);

        return;
    },
    showMines : function() {
        for (var m in this.cells) {
            if (this.cells[m].mine) {
                this.cells[m].open();
            }
        }
    },
    findCell : function(cellId) {
        var cell;
        for(c in this.cells) {
            if( this.cells[c].td.id === cellId ){
                cell = this.cells[c]; 
            }
        }
        return cell;
    },
    flag : function(cellId) {
        var cell = this.findCell(cellId);
        if(cell !== undefined){
            if(!cell.flagged){
                if(this.flags<this.numberOfMines){
                    cell.flag();
                    this.flags++;
                }
            }else{
                cell.flag();
                this.flags--;
            }
            document.getElementById('number-of-flags').innerHTML = this.flags;
        }
    },
    getNeighboursMines : function(cell) {

        var leftLimit = (cell.x-1) < 0 ? 0 : cell.x-1;
        var rightLimit = (cell.x+1) >= this.width ? this.width : cell.x+2;
        var downLimit = (cell.y-1) < 0 ? 0 : cell.y-1;
        var upLimit = (cell.y+1) >= this.height ? this.height : cell.y+2;
        
        var neighbour;
        //cell.minesClose = 0;

        for(var x = leftLimit; x < rightLimit; x++){
            for(var y = downLimit; y < upLimit; y++){
                var neighbour = this.findCell('x' + x + ':' + 'y' + y);              
                if(neighbour.mine){
                    cell.minesClose++;
                }
            }
        }
        return cell.minesClose;
    },
    inspect : function(cellId) {
        
        var cell = this.findCell(cellId);
        
        if(cell !== undefined && cell.state === 'CLOSED'){
            var x = cell.x;
            var y = cell.y;

            var neighboursMines = this.getNeighboursMines(cell);
            
            if(!cell.mine){

                cell.open();

                if(neighboursMines === 0){
                    // Left
                    if(x>0){
                        this.inspect('x' + (x-1) + ':' + 'y' + y);
                    }
                    // Down
                    if(y>0){                    
                        this.inspect('x' + x + ':' + 'y' + (y-1));
                    }
                    // Right
                    if(x<(this.width-1)){
                        this.inspect('x' + (x+1) + ':' + 'y' + y);
                    }
                    // Up
                    if(y<(this.height-1)){
                        this.inspect('x' + x + ':' + 'y' + (y+1));
                    }
                    
                    // Up-Left
                    if(y<(this.height-1) && x>0){
                        this.inspect('x' + (x-1) + ':' + 'y' + (y+1));
                    }
                    // Down-Left
                    if(y>0 && x>0){
                        this.inspect('x' + (x-1) + ':' + 'y' + (y-1));
                    }
                    // Down-Right
                    if(y>0 && x<(this.width-1)){
                        this.inspect('x' + (x+1) + ':' + 'y' + (y-1));
                    }
                    // Up-Right
                    if(y<(this.height-1) && x<(this.width-1)){
                        this.inspect('x' + (x+1) + ':' + 'y' + (y+1));
                    }
                }
            }else{
                this.endGame();
            }
        }
    },
    endGame : function() {
        this.gameOver = true;
        alert('Game Over!');
        this.showMines();
    },
    eventHandler : function(){
        var ms = this;
        
        $('td').mousedown(function(e){
            if(!ms.gameOver){
                var cellId = $(this).attr('id');
                switch(e.button){
                    case 0:
                        ms.inspect(cellId);
                        break;
                    case 2:
                        ms.flag(cellId);
                        break;
                    default:
                        break;
                }
            }
        });
    },
    promptUser : function() {
        var userName = prompt("What's your name?");
        if(userName !== ""){
            this.user = userName;
            document.getElementById('user-name').innerHTML = this.user;
        }
    },
    init : function() {
        document.oncontextmenu = function() {return false;};
        this.paintMenu();
        this.paintTable();
        this.putMines();
        
        while(this.user === null){
            this.promptUser();    
        }
        
        this.eventHandler();
        
        //DEBUGGING
        //this.showMines();
        //console.log('Initializing Mine Sweeper');
        //console.log('Number of mines: ' + this.numberOfMines);
        //console.log('Number of cells: ' + this.width * this.height);
        //console.log(this);
    }
});

$(function() {
    var ms = Object.create(MineSweeper).init();
    //ms.init();
}); 