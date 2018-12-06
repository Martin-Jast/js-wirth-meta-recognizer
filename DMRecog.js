const constants = require('./constants');


class DMRecog{
	constructor(machineType, machineLevel, startingState, smCreator){
		if (machineType === 'EXP'){
			//Agora que tem um starting state nao precisa de machine mais. Arrancar fora
			this.stateMap = constants.EXP_STATE_MACHINE;
			this.currentState = 'EXP_START';
			this.pilha = [];
		} else this.stateMap = constants.GLOBAL_STATE_MAPS;

		this.machineType = machineType;
		this.machineLevel = machineLevel;
		this.stillProcessing = false;
		this.emptyTransition = null;
		this.smCreator = smCreator;
		this.totalDigestedWords = [];
		this.currentState = startingState ? startingState : this.currentState;
	}

	digestSingleWordAndKeepState(word){
		var wordValid = false;
		// get current state transitions
		console.log('Level ' + this.machineLevel +' - Machine State: ' + this.currentState + ', Word: ' + JSON.stringify(word));
		const currentPossibleTransferenceFunctions =constants.GLOBAL_TRANSFERENCE_FUNCTIONS[this.currentState];
		this.terminalTransition = [];
		currentPossibleTransferenceFunctions.forEach((acceptableInputsArray, transferenceFunctionIndex) => {
			if (!this.terminalTransition.length)this.terminalTransition = acceptableInputsArray.filter(transference => constants.TERM.reduce((acc, term)=> acc && (transference.indexOf(term) >= 0)),true);
			else this.terminalTransition = [];
			
			this.emptyTransition = acceptableInputsArray.filter(transference => transference.indexOf(constants.EMPTY_TRANSITION) >= 0).length > 0 ? transferenceFunctionIndex : null; 
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
		while(initialInputClone.length > 0){
			let word = {};
			if (this.pilha.length) {
				//Temos uma pilha. Ela ira consumir o maior comprimento de palavras possivel.
				//preciso retornar -O resto das palavras do array e o token
				const resultadoPilha = this.pilha[this.pilha.length - 1].digestTheWordsArray(initialInputClone);
				initialInputClone = resultadoPilha.leftWords;
				if(resultadoPilha.leftWords.length > 0){
					word.word = resultadoPilha.word || this.lastWord;
					word.token = resultadoPilha.token;
					this.pilha = [];
					this.stillProcessing = false;
					this.totalDigestedWords= resultadoPilha.word? this.totalDigestedWords : [...this.totalDigestedWords,resultadoPilha.word];
				}else{
					// We consumed everything. But we still have state machines on the stack. So it makes no sense in destroying them
					this.stillProcessing = true;
					return {
						...resultadoPilha
					}; 
				}
			}
			if (!word.token) word = {...initialInputClone[0]};


			let wordValid = true;
			wordValid = !!this.digestSingleWordAndKeepState(word);

			if (!wordValid) {
				//Nao achamos uma transferencia direta, we have to go deeper
				if (this.terminalTransition.length) {
					// Empilhando...
					console.log('Podemos andar usando: ' + this.terminalTransition);
					this.pilha.push(new DMRecog(this.terminalTransition[0], this.machineLevel + 1,null, this.smCreator));
					return this.digestTheWordsArray(initialInputClone);
				}else{
					if(this.checkEmptyTransition(word)){
						console.log('EMPTY SERVIRIA');
						if(this.emptyTransition !== null && this.emptyTransition !== undefined){
							this.currentState = constants.GLOBAL_STATE_MAPS[this.currentState][this.emptyTransition];
							// put the word back and go again
							initialInputClone = [word, ...initialInputClone];
							return this.digestTheWordsArray(initialInputClone);
						}else{
							console.log('MAS CADE A EMPTY ?!');
							//We didn't find nothing
							return {
								leftWords: [lastWord, ...initialInputClone],
								word: lastWord && lastWord.word,
								totalDigestedWords: this.totalDigestedWords,
								token: constants.ACCEPTION_STATES.includes(this.currentState) ? this.machineType : word.token ||null,
							};
						}
					}
					//We didn't find nothing
					return {
						leftWords: [lastWord, ...initialInputClone],
						word: lastWord && lastWord.word,
						totalDigestedWords: this.totalDigestedWords,
						token: constants.ACCEPTION_STATES.includes(this.currentState) ? this.machineType : word.token ||null,
					};
				}
				
			}
			lastWord = word && word.word ;
			this.totalDigestedWords.push(word.word);
			initialInputClone.shift(); // Remove front since we already comsumed this word
		}
		return {
			word: initialInputClone[0]|| lastWord,
			totalDigestedWords: this.totalDigestedWords,
			token: this.machineType,
			leftWords: initialInputClone,
		};

	}
	checkAcception(){
		return constants.ACCEPTION_STATES.includes(this.currentState) || this.stillProcessing;
	}

	getStatus(){
		// TODO - If necessary
		return {
			acceptedState: this.acceptedState,
			error: this.error
		};
	}


	// Check if the machine should be walking in the empty transition
	checkEmptyTransition(word){
		var emptyPossible = true;
		const currentPossibleTransferenceFunctions =constants.GLOBAL_TRANSFERENCE_FUNCTIONS[this.currentState];
		currentPossibleTransferenceFunctions.forEach((acceptableInputsArray, transferenceFunctionIndex) => {
			if (emptyPossible && (acceptableInputsArray.includes(constants.EMPTY_TRANSITION) )) {
				//Estamos supondo que só vai existir uma EMPTY transition
				emptyPossible = emptyPossible && this.checkLookUp(word, constants.GLOBAL_STATE_MAPS[this.currentState][transferenceFunctionIndex]);
			}
		});

		return emptyPossible;
	}

	// It checks if the word would be accepted by an next state if it receives it.
	checkLookUp(word, possibleNextState){
		// Caso tenhamos um estado que vai para si mesmo com vazio, temos um problema de recursão infinita aqui. Logo colocamos a condição de retorno básica.
		if(possibleNextState == this.currentState)return false;
		const simulationMachine = new DMRecog(null,this.machineLevel +1 ,possibleNextState);
		const resultadoSimulation = simulationMachine.digestTheWordsArray([word]);
		return !resultadoSimulation.length;

	}
}

module.exports = {
	DMRecog
};
