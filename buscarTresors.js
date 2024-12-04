const fs = require('fs');

class BuscaTresors {
    constructor() {
        this.rows = 6;
        this.cols = 8;
        this.board = this.createBoard();
        this.hiddenBoard = this.createBoard();
        this.treasures = this.placeTreasures(16);
        this.turns = 32;
        this.foundTreasures = 0;
        this.cheatMode = false;
    }

    createBoard() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill('·'));
    }

    placeTreasures(count) {
        const treasures = [];
        while (treasures.length < count) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (!treasures.some(([r, c]) => r === row && c === col)) {
                treasures.push([row, col]);
                this.hiddenBoard[row][col] = 'T';
            }
        }
        return treasures;
    }

    showBoard() {
        console.log('  ' + [...Array(this.cols).keys()].join(''));
        this.board.forEach((row, i) => console.log(String.fromCharCode(65 + i) + row.join('')));
        if (this.cheatMode) {
            console.log('\nTauler trampa:');
            this.hiddenBoard.forEach((row, i) => console.log(String.fromCharCode(65 + i) + row.join('')));
        }
    }

    distToTreasure(row, col) {
        return Math.min(...this.treasures.map(([r, c]) => Math.abs(row - r) + Math.abs(col - c)));
    }

    makeMove(command) {
        const match = command.match(/destapar\s+([A-F])(\d)/);
        if (match) {
            const row = match[1].charCodeAt(0) - 65;
            const col = parseInt(match[2], 10);
            if (this.hiddenBoard[row][col] === 'T') {
                this.board[row][col] = 'T';
                this.hiddenBoard[row][col] = '·';
                this.foundTreasures++;
                console.log('Tresor trobat!');
                if (this.foundTreasures === 16) {
                    console.log(`Has guanyat amb només ${32 - this.turns} tirades!`);
                    process.exit();
                }
            } else {
                this.turns--;
                console.log(`Distància al tresor més proper: ${this.distToTreasure(row, col)}`);
                if (this.turns === 0) {
                    console.log(`Has perdut, queden ${16 - this.foundTreasures} tresors.`);
                    process.exit();
                }
            }
        }
    }

    saveGame(fileName) {
        fs.writeFileSync(fileName, JSON.stringify(this));
        console.log('Partida guardada!');
    }

    static loadGame(fileName) {
        const data = JSON.parse(fs.readFileSync(fileName));
        const game = new BuscaTresors();
        Object.assign(game, data);
        return game;
    }

    toggleCheatMode() {
        this.cheatMode = !this.cheatMode;
    }
}

function main() {
    let game = new BuscaTresors();

    console.log('Benvingut a Busca Tresors!');
    game.showBoard();

    process.stdin.on('data', (input) => {
        const command = input.toString().trim();
        if (command === 'ajuda' || command === 'help') {
            console.log('Comandes disponibles: ajuda, destapar A1, activar/desactivar trampa, guardar partida "nom.json", carregar partida "nom.json"');
        } else if (command.startsWith('destapar')) {
            game.makeMove(command);
        } else if (command.startsWith('guardar partida')) {
            const fileName = command.split('"')[1];
            game.saveGame(fileName);
        } else if (command.startsWith('carregar partida')) {
            const fileName = command.split('"')[1];
            game = BuscaTresors.loadGame(fileName);
            console.log('Partida carregada!');
        } else if (command === 'activar trampa' || command === 'desactivar trampa') {
            game.toggleCheatMode();
        }
        game.showBoard();
    });
}

main();
