const { FileProcessor } = require('./FileProcessor.js');
const { DMRecog } = require('./DMRecog.js');


const fp = new FileProcessor();
const dm = new DMRecog('GRAMMAR', 0);

async function main() {

	fp.setSourceFileName('DartmouthBASIC.txt');
	// const line = await fp.getNextLine();
	var aceitacao = true;
	while (fp.nextLine() && aceitacao) {
		const wordsArray = fp.getLineWords();
		console.log('-------Linha-------');
		aceitacao = dm.digestTheWordsArray(wordsArray).token && aceitacao;
		console.log('--Fim da Linha--');
	}
	if (aceitacao)console.log('Gramatica Aceita!');
	else console.log('Gramatica rejeitada');
}
main();
