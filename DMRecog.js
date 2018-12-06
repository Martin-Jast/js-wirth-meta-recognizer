const constants = require('./constants');


class DMRecog{
	constructor(machineType, machineLevel){
		if (machineType === 'EXP'){
			this.stateMap = constants.EXP_STATE_MACHINE;
			this.currentState = 'EXP_START';
			this.pilha = [];
		} else this.stateMap = constants.GLOBAL_STATE_MAPS;

		this.machineType = machineType;
		this.machineLevel = machineLevel;
	}

	digestSingleWordAndKeepState(word){
		var wordValid = false;
		// get current state transitions
		console.log('Level ' + this.machineLevel +' - Machine State: ' + this.currentState + ', Word: ' + JSON.stringify(word));
		const currentPossibleTransferenceFunctions =constants.GLOBAL_TRANSFERENCE_FUNCTIONS[this.currentState];
		this.terminalTransition = [];
		currentPossibleTransferenceFunctions.forEach((acceptableInputsArray, transferenceFunctionIndex) => {
			if (!this.terminalTransition.length)this.terminalTransition = acceptableInputsArray.filter(transference => transference.indexOf(constants.TERM[0]) >= 0 || transference.indexOf(constants.TERM[1]) >= 0);
			else this.terminalTransition = [];
			// if we didn't find a suitable next state we try, else just ignore it,  we know where we are going
			if (!wordValid && (acceptableInputsArray.includes(word.token) || acceptableInputsArray.includes(word.word))) {
				// We found a suitable next Stateasddda asd
				wordValid = true;
				this.currentState = constants.GLOBAL_STATE_MAPS[this.currentState][transferenceFunctionIndex];
			}
		});

		if (wordValid){
			return word;
		}
		return null;
	}


	// A ideia para a transicao é a seguinte. Nós temos um mapa de estados e um mapa de transições
	// Dado que estamos num estado X pegamos todas as transições no estado X usando o mapaDeFuncoes[X].
	// Esse para sabermos qual o proximo estado (e se podemos ir para ele) só precisamos saber qual o numero
	// Da array que contém o que veio, pegamos então essa valor K do mapa de transicoes mapaDeTransiçoes[X][K]

	digestTheWordsArray(wordsArray){
		var initialInputClone = [...wordsArray];
		var lastWord = null; // Odeio fazer isso mas não tem jeito....
		if(!this.currentState){
			this.currentState = 'START';
			this.pilha = [];
		}
		var accepted = true;
		while(initialInputClone.length > 0){
			let word = {};
			if (this.pilha.length) {
				//Temos uma pilha. Ela ira consumir as palavras ate que fique vazia.
				//preciso retornar -O resto das palavras do array e o token
				const resultadoPilha = this.pilha[this.pilha.length - 1].digestTheWordsArray(initialInputClone);
				initialInputClone = resultadoPilha.leftWords;
				word.word = resultadoPilha.word;
				word.token = resultadoPilha.token;
				if(resultadoPilha.leftWords.length > 0){
					this.pilha = [];
				}else{
					return resultadoPilha; // We consumed everything. But we still have state machines on the stack. So it makes no sense in destroying them
				}
			}
			if (!word.token) word = {...initialInputClone[0]};


			let wordValid = true;
			wordValid = !!this.digestSingleWordAndKeepState(word);

			if (!wordValid) {
				//Nao achamos uma transferencia direta, we have to go deeper
				if (this.terminalTransition.length) {
					// Empilhando
					console.log('Podemos andar usando: ' + this.terminalTransition);
					this.pilha.push(new DMRecog(this.terminalTransition[0], this.machineLevel + 1));
					return this.digestTheWordsArray(initialInputClone);
				}
				//We didn't find nothing
				return {
					leftWords: [lastWord, ...initialInputClone],
					word: lastWord && lastWord.word,
					token: constants.ACCEPTION_STATES.includes(this.currentState) ? this.machineType : word.token ||null,
				};
			}
			if(accepted){
				lastWord = word && word.word;
				initialInputClone.shift(); // Remove front since we already comsumed this word
			}
		}
		if(accepted)
			return {
				word: initialInputClone[0],
				token: this.machineType,
				leftWords: initialInputClone,
			};

	}


	getStatus(){
		return {
			acceptedState: this.acceptedState,
			error: this.error
		};
	}
}

module.exports = {
	DMRecog
};
