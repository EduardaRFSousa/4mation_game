const statusText = document.getElementById("statusText");
const message = document.getElementById("message");
const resetBtn = document.querySelector(".button");
let cells = document.querySelectorAll(".cell");
let gameBoard = [];

let emptyCells;
let gameActive;
let currentPlayer;
let firstTurn;

const neighbors = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],            [0, 1],
    [1, -1],   [1, 0],  [1, 1],
];

function addListener(cell, row, column) {
    if (!cell.dataset.listener || cell.dataset.listener === "false") {
        const listener = () => handleCellClick(row, column);
        cell.listenerRef = listener; //Conveniência para uso de função anônima no removeListener
        cell.addEventListener("click", listener);
        cell.dataset.listener = "true";
    }
}

function removeListener(cell) {
    if (cell.dataset.listener === "true" && cell.listenerRef) {
        cell.removeEventListener("click", cell.listenerRef);
        cell.dataset.listener = "false";
        delete cell.listenerRef;
    }
}

/* EXPLICAÇÃO: Manuseio de cell e newCell
initializeGame() é uma função utilizada tanto para 
criar o tabuleiro, quanto para resetar, a clonagem 
da célula e a remoção da versão antiga permite que
todo o histórico de eventos seja eliminado, preve-
nindo bugs futuros.
*/
function initializeGame(){
    gameBoard.length = 0;
    cells = document.querySelectorAll(".cell");

    for(let i = 0; i < 7; i++){
        let line = [];
        for(let j = 0; j < 7; j++){
            line.push(null);
        }
        gameBoard.push(line);
    }

    cells.forEach(cell => {
        const newCell = cell.cloneNode(true);
        let row = parseInt (cell.getAttribute("row"));
        let column = parseInt (cell.getAttribute("column"));
        cell.replaceWith(newCell);

        newCell.className = "cell blank";
        newCell.dataset.listener = "false";
        gameBoard [row][column] = newCell;
        newCell.classList.add("active");
        addListener(newCell, row, column);
        
    });

    cells = document.querySelectorAll(".cell");

    statusText.textContent = "É a vez do... Jogador";
    message.textContent = "Azul";
    message.className = "text blue";
    message.style.display = "block";
    currentPlayer = "blue";
    firstTurn = true;
    gameActive = true;
    emptyCells = 49;
}

function switchPlayer(){
    if(currentPlayer === "blue"){
        message.textContent = "Vermelho";
        message.classList.replace("blue","red");
        currentPlayer = "red";
    } else {
        message.textContent = "Azul";
        message.classList.replace("red", "blue");
        currentPlayer = "blue";
    }
}

function gameStatus(selectedCell) {
    let draw = false;
    let row = parseInt(selectedCell.getAttribute("row"));
    let column = parseInt(selectedCell.getAttribute("column"));

    for (const cell of cells) {
        if (cell.classList.contains("active")) {
            draw = true;
            break;
        }
    }

    if (!draw || emptyCells === 0) {
        gameActive = false;
        statusText.textContent = "Empate! Nenhuma jogada possível";
        message.style.display = "none";
        return;
    }

    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal principal
        [1, -1]   // diagonal secundária
    ];

    for (const [di, dj] of directions) {
        let count = 1;
        const sequence = [selectedCell];

        // Caminha para frente
        let i = row + di;
        let j = column + dj;
        while (i >= 0 && i < 7 && j >= 0 && j < 7 && gameBoard[i][j].classList.contains(currentPlayer)) {
            sequence.push(gameBoard[i][j]);
            count++;
            i += di;
            j += dj;
        }

        // Caminha para trás
        i = row - di;
        j = column - dj;
        while (i >= 0 && i < 7 && j >= 0 && j < 7 && gameBoard[i][j].classList.contains(currentPlayer)) {
            sequence.push(gameBoard[i][j]);
            count++;
            i -= di;
            j -= dj;
        }

        if (count >= 4) {
            sequence.forEach(cell => cell.classList.add("victory"));
            cells.forEach(cell => cell.classList.remove("active"));
            gameActive = false;
            statusText.textContent = `O jogador ${currentPlayer === "blue" ? "Azul" : "Vermelho"} venceu!`;
            message.style.display = "none";
            return;
        }
    }
}

function handleCellClick(row, column) {
    const selectedCell = gameBoard[row][column];
    if (!gameActive || selectedCell.classList.contains("blue") || selectedCell.classList.contains("red")) return;

    selectedCell.classList.remove("blank", "active");
    selectedCell.classList.add(currentPlayer);

    cells.forEach(cell => {
        if (cell.classList.contains("blank") || cell.classList.contains("active")){
            cell.classList.remove("active");
            cell.classList.add("blank");
            removeListener(cell);
        }
    })

    neighbors.forEach(([di, dj]) => {
        const i = row + di;
        const j = column + dj;

        if (i >= 0 && i < 7 && j >= 0 && j < 7){
            const newCell = gameBoard[i][j];
            if(newCell.classList.contains("blank")){
                newCell.classList.replace("blank", "active");
                addListener(newCell, i, j);
            }
        }
    });

    gameStatus(selectedCell);
    switchPlayer();
    emptyCells--;
}

resetBtn.addEventListener ("click", function resetGame(){
    gameBoard = [];
    emptyCells = 49;
    currentPlayer = "blue";
    message.style.display = "block";
    initializeGame();
});

document.addEventListener('DOMContentLoaded', initializeGame);