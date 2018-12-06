const { FileProcessor } = require('./FileProcessor.js');
const { DMRecog } = require('./DMRecog.js');
const { StateMachineCreator } = require('./StateMachineCreator.js');


const fp = new FileProcessor();
const smCreator = new StateMachineCreator();
const dm = new DMRecog('GRAMMAR', 0,null, smCreator);


async function main() {

	fp.setSourceFileName('DartmouthBASIC.txt');
	// const line = await fp.getNextLine();
	var aceitacao = true;
	while (fp.nextLine() && aceitacao) {
		const wordsArray = fp.getLineWords();
		console.log('-------Linha-------');
		const result = dm.digestTheWordsArray(wordsArray);
		aceitacao = dm.checkAcception();
		console.log('--Fim da Linha--');
	}
	if (aceitacao)console.log('Gramatica Aceita!');
	else console.log('Gramatica rejeitada');
}
main();
