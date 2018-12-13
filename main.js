const { FileProcessor } = require('./FileProcessor.js');
const { DMRecog } = require('./DMRecog.js');
const { StateMachineCreator } = require('./StateMachineCreator.js');
const  fs  = require('fs');


const fp = new FileProcessor();
const smCreator = null;//new StateMachineCreator();
const dm = new DMRecog('GRAMMAR', 0,null, smCreator);
dm.debugOn = false;

async function main() {

	fp.setSourceFileName('DartmouthBASIC.txt');
	// const line = await fp.getNextLine();
	var aceitacao = true;
	while (fp.nextLine() && aceitacao) {
		const wordsArray = fp.getLineWords();
		const result = dm.digestTheWordsArray(wordsArray);
		aceitacao = dm.checkAcception();
	}
	if (aceitacao){
		console.log('Gramatica Aceita!');
		if(smCreator)smCreator.basicReduce();
		fs.writeFile('automatoStados.txt', JSON.stringify(smCreator &&smCreator.getMap()), function(err) {
			if (err) throw err;
		  });
		  fs.writeFile('automatoTrans.txt', JSON.stringify(smCreator &&smCreator.getTrans()), function(err) {
			if (err) throw err;
		  });
	}


	else console.log('Gramatica rejeitada');
}
main();
