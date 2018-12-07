const {CHARACTER_EXTRACTOR, RESERVED_CHARS} = require('./constants');
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
	if(!str)return false;
	return !!(str.length === 1 && str.match(/[0-9]+(\.[0-9]+)?/i) && str.match(/[0-9]*\.?[0-9]*/i)[0]);
}
function isIdentifier(str){
	let isIdentifierC = false;
	for (var i = 0; i < str.length; i++) {
		isIdentifierC = isIdentifierC || isLetter(str.charAt(i));
	}
	return isIdentifierC;
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
			line = this.popLineCharacter(line); // Returns the remaining line
			if(char === '.' && lineWords[lineWords.length - 1] && lineWords[lineWords.length - 1].token === CHARACTER_EXTRACTOR.NUMBER){
				if(isNumber(lineWords[lineWords.length - 1].word + '.')){
					lineWords[lineWords.length - 1].word += char;
				}
			}else if(isLetterOrNumber(char) || (openedQuotes && char === ' ')){
				if (!lineWords.length || lineWords[lineWords.length - 1].token !== CHARACTER_EXTRACTOR.IDENTIFIER && 
					 lineWords[lineWords.length - 1].token !== CHARACTER_EXTRACTOR.STRING && 
					 lineWords[lineWords.length - 1].token !== CHARACTER_EXTRACTOR.NUMBER && 
					 lineWords[lineWords.length - 1].token !== CHARACTER_EXTRACTOR.DIGIT){
					lineWords.push({
						word: '',
						token: openedQuotes ? CHARACTER_EXTRACTOR.STRING : isNumber(char) ? CHARACTER_EXTRACTOR.DIGIT : CHARACTER_EXTRACTOR.IDENTIFIER,
					});
				}else{
					lineWords[lineWords.length - 1].token = isNumber(char) && lineWords[lineWords.length - 1].token === CHARACTER_EXTRACTOR.DIGIT
					 ? CHARACTER_EXTRACTOR.NUMBER : lineWords[lineWords.length - 1].token;
				}
				lineWords[lineWords.length - 1].word += char;
				lineWords[lineWords.length - 1].token = isIdentifier(lineWords[lineWords.length - 1].word) && !openedQuotes ? CHARACTER_EXTRACTOR.IDENTIFIER : lineWords[lineWords.length - 1].token;
			} else if(char === '"'){
				
				if(lineWords[lineWords.length - 1].token === CHARACTER_EXTRACTOR.QUOTE_MARK && openedQuotes){
					lineWords.push({
						word:'"',
						token: CHARACTER_EXTRACTOR.STRING
					});
				}else{
					lineWords.push({
						word:'"',
						token: CHARACTER_EXTRACTOR.QUOTE_MARK
					});
					openedQuotes = !openedQuotes;
				}
			} else{
				// So nao excluimos espacos em casos de strings
				if((char !== '\r'&& char !== ' ')){
					lineWords.push({
						word:char,
						token: openedQuotes ? CHARACTER_EXTRACTOR.STRING : RESERVED_CHARS.includes(char) ? CHARACTER_EXTRACTOR.DELIMITER :CHARACTER_EXTRACTOR.SPECIAL
					});
				}
			}
		}
		lineWords.forEach(lineWord => lineWord.word = lineWord.word.split('').reverse().join(''));
		if(openedQuotes){
			// Linha terminou com aspas abertas, ERRO
			throw new Error(`[ERROR] Line: ${this.lineNumber + 1} - Line ends with an open quotemark!`);
		}
		
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
