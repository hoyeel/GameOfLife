const unitLength  = 20;
const boxColor= 150
const strokeColor = 50;  //50
let fr=30;
let columns=window.innerHeight; /* To be determined by window width */
let rows=window.innerWidth;    /* To be determined by window height */
let currentBoard;
let nextBoard;
var lonelinessNum=2;
var overpopulationNum=3;
const colorObject = {};
//let firstStart=true; //doesn't start looping until Start button is pressed and avoid faulty prevBoard checking

var slider=document.querySelector("#fpsRange");
var currentFPS=document.querySelector("span.currentFPS");
var resetButton=document.querySelector(".reset-btn");
var startButton=document.querySelector(".start-btn");
var randomButton=document.querySelector(".random-btn");
var gliderButton=document.querySelector(".glider-btn");
var gosperGunButton=document.querySelector(".gosper-gun-btn");
var trainButton=document.querySelector(".train-btn");
var classicButtons=document.querySelectorAll(".classic-btn");
var keyboardMode=document.querySelector(".keyboard-mode");
// var gliderButton = document.querySelector(".glider-btn");
// var gosperButton = document.querySelector(".gosper-gun-btn");
// var trainButton = document.querySelector(".train-btn");


var lonelinessInput=document.querySelector("input.loneliness");
var overpopulationInput=document.querySelector("input.overpopulation");
var lonelinessDisplay=document.querySelector("span.loneliness");
var overpopulationDisplay=document.querySelectorAll("span.overpopulation");
var timer=null;


function setup(){
	/* Set the canvas to be under the element #canvas*/
	const canvas = createCanvas(windowWidth, windowHeight-100);
    //windowWidth and Height are mapped to window.innerWidth and innerHeight
    
	canvas.parent(document.querySelector('#canvas'));

	/*Calculate the number of columns and rows */
	columns = floor(width  / unitLength);
	rows    = floor(height / unitLength);
	
	/*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
	currentBoard = [];
	nextBoard = [];
	for (let i = 0; i < columns; i++) {
		currentBoard[i] = [];
		nextBoard[i] = []
    }
	// Now both currentBoard and nextBoard are array of array of undefined values.
	init();  // Set the initial values of the currentBoard and nextBoard
}

/**
* Initialize/reset the board state
*/
function  init(plain=true) {
    //Reset currentFPS
    currentFPS.innerHTML= document.querySelector(".slider-section input.slider").value;

	for (let i = 0; i < columns; i++) {
		for (let j = 0; j < rows; j++) {
			currentBoard[i][j] = plain? 0:Math.round(Math.random());
			nextBoard[i][j] = plain? 0:Math.round(Math.random());
		}
	}
}

function draw(){
    let r=  Math.floor(Math.random()*255);
    let g= Math.floor(Math.random()*255);
    let b= Math.floor(Math.random()*255);
    background(255);
    frameRate(fr);
    generate();
    // if(firstStart){
    //     noLoop();
    // }
    
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            if (currentBoard[i][j] == 1){
                if((currentBoard[i][j]==prevBoard[i][j])){ //if life is stable, darken color 
                    fill(0);
                }else{
                    fill(r,g,b); 
                    
                }
            }else{
                fill(255);
            } 
            stroke(strokeColor);
            rect(i * unitLength, j * unitLength, unitLength, unitLength);
        }
    }
}

function generate() {
    //Loop over every single box on the board
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            // Count all living members in the Moore neighborhood(8 boxes surrounding)
            let neighbors = 0;
            for (let i of [-1, 0, 1]) {
                for (let j of [-1, 0, 1]) {
                    if( i == 0 && j == 0 ){
	                    // the cell itself is not its own neighbor
	                    continue;
	                }
                    // The modulo operator is crucial for wrapping on the edge
                    neighbors += currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
                }
            }

            // Rules of Life
            if (currentBoard[x][y] == 1 && neighbors < lonelinessNum) {
                // Die of Loneliness
                nextBoard[x][y] = 0;
            } else if (currentBoard[x][y] == 1 && neighbors > overpopulationNum) {
                // Die of Overpopulation
                nextBoard[x][y] = 0;
            } else if (currentBoard[x][y] == 0 && neighbors == overpopulationNum) {
                // New life due to Reproduction
                nextBoard[x][y] = 1;
            } else {
                // Stasis
                nextBoard[x][y] = currentBoard[x][y];

            }
        }
    }
    
    // Swap the nextBoard to be the current Board
    [prevBoard,currentBoard, nextBoard] = [currentBoard,nextBoard, currentBoard];
}

function mouseDragged() {
    /**
     * If the mouse coordinate is outside the board
     */
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
        return;
    }
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    currentBoard[x][y] = 1;
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
}



/**
 * When mouse is pressed
 */
function mousePressed() {
    noLoop();
    mouseDragged();
}

/**
 * When mouse is released
 */
function mouseReleased() {
    loop();
    // startButton.value="Pause";
    for(let classicButton of classicButtons){
        const x = Math.floor(mouseX / unitLength);
        const y = Math.floor(mouseY / unitLength);

    if(classicButton.classList.contains("activated")){
        if(classicButton.classList.contains("glider-btn")){
            addGlider(x, y);

        }else if(classicButton.classList.contains("gosper-gun-btn")){
            addGosperGun(x,y);

        }else if(classicButton.classList.contains("train-btn")){
            addLightWeightSpaceship(x,y);

        }
    }
};
    //firstStart=false;
    //when release update current FPS value
    currentFPS.innerHTML= slider.value;
}

function windowResized() {
    noLoop();
    resizeCanvas(windowWidth, windowHeight);
    setup();
    loop();
}

function insertPattern (patternArray,x,y) {
    let patternWidth = getPatternWidth(patternArray)
    let patternHeight = patternArray.length
    for (i=0; i < patternHeight; i++) {  //patternHeight
        for (j=0; j<patternWidth; j++) { //patternWidth
            if (patternArray[i][j]) {
                currentBoard[x][y] = patternArray[i][j];
            } else {
                currentBoard[x][y] = 0
            }
            y++;
            if(y==patternWidth){
                y=0;
            }
        }
        x++;
    }
}

function getPatternWidth (patternArray) {
    let rowLengthArray = []
    for (row of patternArray) {
        rowLengthArray.push(row.length)
    }
    return Math.max(...rowLengthArray)
}

function addClassicPattern(pattern,x,y){
    let patternRowStringArray = pattern.split("\n")
    // console.log('patternRowStringArray', patternRowStringArray)
    let pattern2DArray = []
    for (i in patternRowStringArray) {
        let patternRowArray = []
        for (j of patternRowStringArray[i]) {
            if (j==".") {
                patternRowArray.push(0)
            }else if(j=="O") {
                patternRowArray.push(1)
            }
        }
        // console.log('patternRowArray', patternRowArray)
        pattern2DArray.push(patternRowArray)
    }
    // console.log('pattern2DArray', pattern2DArray);

    insertPattern(pattern2DArray,x,y);
}


function addGlider(x,y){
    let pattern=`.O.
    ..O
    OOO`;
    addClassicPattern(pattern,x,y);
}

function addGosperGun(x,y){
    let pattern=`........................O
    ......................O.O
    ............OO......OO............OO
    ...........O...O....OO............OO
    OO........O.....O...OO
    OO........O...O.OO....O.O
    ..........O.....O.......O
    ...........O...O
    ............OO`;
    addClassicPattern(pattern,x,y);
}

function addLightWeightSpaceship(x,y){
    let pattern=`.....................O...
    ..................OOOO...
    .............O..O.OO.....
    .............O...........
    OOOO........O...O.OO.....
    O...O.....OO.OO.O.O.OOOOO
    O.........OO.O.O.O..OOOOO
    .O..O..OO..O...OOO..O.OO.
    ......O..O.OO............
    ......O....OO............
    ......O..O.OO............
    .O..O..OO..O...OOO..O.OO.
    O.........OO.O.O.O..OOOOO
    O...O.....OO.OO.O.O.OOOOO
    OOOO........O...O.OO.....
    .............O...........
    .............O..O.OO.....
    ..................OOOO...
    .....................O...`;
    addClassicPattern(pattern,x,y);

}

function activateButton(buttonBeingClicked){
    //console.log(this);
    for(let classicButton of classicButtons){
        if(classicButton.value==buttonBeingClicked.value){
            if(classicButton.classList.contains("activated")){
                classicButton.classList.remove("activated");
                classicButton.style.backgroundColor = '#EFEFEF';
                classicButton.style.color='black';
            }else{
                classicButton.classList.add("activated");
                classicButton.style.backgroundColor = 'black';
                classicButton.style.color='#EFEFEF';
            }
        }
        else{
            classicButton.classList.remove("activated");
            classicButton.style.backgroundColor = '#EFEFEF';
            classicButton.style.color='black';
        }
}}

function selectBox(x,y){
    currentBoard[x][y];


}



// Update the current slider value (each time you drag the slider handle)
slider.oninput=function(){
    fr=parseInt(this.value);

    //Change FPS depending on the slider
    currentFPS.innerHTML=this.value;
    startButton.value=="Pause"
    
}

//Start/Pause Button
startButton.addEventListener("click",(event)=>{
    console.log("start");
    // startButton.value=startButton.value=="Start" ? "Pause": "Start";
    if(startButton.value=="Start"){
        loop();
        startButton.value="Pause";
    }else{
        noLoop();
        startButton.value="Start";
    }
});

//Random Button
randomButton.addEventListener("click",(event)=>{
    console.log("random");
    init(plain=false);
    noLoop();

    // startButton.classList.add("stopByButton");
})

//Reset Button
resetButton.addEventListener("click",(event)=>{
    console.log("reset");
    init(plain=true);
    loop();
})

for(let classicButton of classicButtons){
    classicButton.addEventListener("click",(event)=>{
        activateButton(classicButton);

})};




//Rules Changing
lonelinessInput.addEventListener("keyup",() =>{
    console.log(timer);
    clearTimeout(timer);

    timer=setTimeout(function(){
        lonelinessDisplay.innerHTML=lonelinessInput.value
        lonelinessNum=lonelinessInput.value;
        console.log(lonelinessNum);
    }, 1000);
});

overpopulationInput.addEventListener("keyup",() =>{
    clearTimeout(timer);
    timer=setTimeout(function(){
        for(let value of overpopulationDisplay)
            value.innerHTML=overpopulationInput.value
            overpopulationNum=overpopulationInput.value;
            console.log(overpopulationNum);
    }, 1000);
});

window.addEventListener('resize', (event) => {
    windowResized([event]);
}, true);

window.addEventListener('keydown', (event) => {
    
    console.log(event.keyCode);
    if(event.keyCode == 37){
        
    }else if(event.keyCode == 38){


    }else if(event.keyCode==39){
    
    
    
    }else if(event.keyCode==40){


    }
},true)


















