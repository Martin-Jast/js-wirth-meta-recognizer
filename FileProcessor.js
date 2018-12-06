const {CHARACTER_EXTRACTOR} = require('./constants');
var fs = require('fs');
var stream = require('stream');

function characterExtractor(line){
	const char = line && line.length > 1 ? line.slice(-1) : line && line.length > 0 ? line[0] :  null;
	//remover o caracter da linha
	return char;
}

function isLetter(str) {
	return !!(str.length === 1 && str.match(/[a-zA-Z]/i));
}
function isNumber(str) {
	return !!(str.length === 1 && str.match(/[0-9]/i));
}
function isLetterOrNumber(str) {
	return isLetter(str)||isNumber(str);
}

class FileProcessor {

	// O objeto processador de texto vai ter as seguintes propriedades
	// sourceFileName
	// source
	// alreadyReadLines
	// lineNumber

	setSourceFileName(name) {
		this.sourceFileName = name;
		this.alreadyReadLines = [];
		this.source = [];
		// Comecamos em -1 para podermos iterar facilmente dentro das linhas do source
		this.lineNumber = -1;
		this.source = fs.readFileSync(name, 'utf-8')
			.split('\n')
			.filter(Boolean);
	}

	printCompleteSourceCode(){
		const newCode = [];
		this.source.forEach(line => {
			console.log(line);
		});
	}

	popLineCharacter(line){
		return line && line.slice(0, line.length - 1);
	}

	getLineWords(){
		if(this.lineNumber === -1) this.getNextLine();

		var line = this.source[this.lineNumber];

		const lineWords = [];
		var openedQuotes = false;
		while(line && line.length >= 0){
			const char = characterExtractor(line);
			line = this.popLineCharacter(line);
			if(isLetterOrNumber(char) || (openedQuotes && char === ' ')){
				if (!lineWords.length || lineWords[lineWords.length - 1].token !== CHARACTER_EXTRACTOR.IDENTIFIER){
					lineWords.push({
						word: '',
						token: openedQuotes ? CHARACTER_EXTRACTOR.STRING : CHARACTER_EXTRACTOR.IDENTIFIER,
					});
				}
				lineWords[lineWords.length - 1].word += char;
				lineWords[lineWords.length - 1].token = CHARACTER_EXTRACTOR.IDENTIFIER;
			} else if(char === '"'){
				lineWords.push({
					word:'"',
					token: CHARACTER_EXTRACTOR.QUOTE_MARK
				});

				openedQuotes = !openedQuotes;
			} else{
				// So nao excluimos espacos em casos de strings
				if((char !== '\r'&& char !== ' ')){
					lineWords.push({
						word:char,
						token: openedQuotes ? CHARACTER_EXTRACTOR.STRING : CHARACTER_EXTRACTOR.SPECIAL
					});
				}
			}
		}
		if(openedQuotes){
			// Linha terminou com aspas abertas, ERRO
			throw new Error(`[ERROR] Line:  + ${this.lineNumber + 1} +  - Line ends with an open quotemark!`);
		}
		lineWords.forEach(lineWord => lineWord.word = lineWord.word.split('').reverse().join(''));
		return lineWords.reverse();
	}

	nextLine(){
		if(this.source[this.lineNumber + 1]){
			this.lineNumber = this.lineNumber + 1;
			return true;
		}
		return false;
	}

}

module.exports={
	FileProcessor
};
