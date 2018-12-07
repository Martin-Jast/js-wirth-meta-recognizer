const constants = require('./constants');

class StateMachineCreator{
	constructor(subMachineType, statesMap, transitionsMap, NT){
		this.stateCounter = 1;
		this.currentState = 0;
		this.startingState = this.currentState;
		this.endingState = this.endingState;
		// STACK - {(currentState, counter)}
		this.stack = [];
		this.statesMap = statesMap || {};
		this.transitionsMap = transitionsMap || {};
		this.subMachineType = subMachineType || '';
		this.NT = NT || [];
	}
    
	// processWord(word){
	// 	const currentStateName = 's'+ this.stateCounter;
	// 	switch(word.token){
	// 	case constants.CHARACTER_EXTRACTOR.STRING:
	// 		// Simple case we consume the string with an state transition
	// 		// Add to map
	// 		this.statesMap[currentStateName] = this.statesMap[currentStateName] ? 
	// 			[...this.statesMap[currentStateName], 's'+(this.stateCounter+1)] : [];
                
	// 		//Add to Transitions
	// 		const transitionIndex = this.statesMap[currentStateName].indexOf('s'+(this.stateCounter+1));
	// 		if(transitionIndex === -1){
	// 			this.transitionsMap[currentStateName][transitionIndex] = [];
	// 		} 
	// 		this.transitionsMap[currentStateName][transitionIndex].push(word.word);
	// 		//Increase Number of States
	// 		this.stateCounter+=1;
	// 		break;
	// 	case constants.CHARACTER_EXTRACTOR.IDENTIFIER:
	//         // Identifier case. We need to know if it is an Terminal or Non-Terminal to see where to put it.

	// 		break;
	// 	case constants.CHARACTER_EXTRACTOR.QUOTE_MARK:
            
	// 		break;
	// 	case constants.CHARACTER_EXTRACTOR.SPECIAL:
	// 		//Most complex case, we are separating it.
	// 		break;
	// 	default:
	// 		throw new Error('No way to process: ' + word);
	// 	}
	// }

	addStateToMapAndCreateSimpleTransition(consumed, fromState, toState){
		// Add to map
		this.statesMap[fromState] = this.statesMap[fromState] ? 
			[...this.statesMap[fromState], toState] : [toState];
		this.statesMap[toState] = this.statesMap[toState] ? 
			this.statesMap[toState] : [];        
		//Add to Transitions
		let transitionIndex = this.statesMap[fromState].indexOf(toState);
		if(transitionIndex === -1) transitionIndex =0;
		//Initialize what is needed
		this.transitionsMap[fromState] = this.transitionsMap[fromState] ? this.transitionsMap[fromState] : [];
		this.transitionsMap[fromState][transitionIndex] = this.transitionsMap[fromState][transitionIndex] ?   this.transitionsMap[fromState][transitionIndex] : [];
		//
		this.transitionsMap[fromState][transitionIndex].push(consumed || constants.EMPTY_TRANSITION);
	}

	defineNT(NT){
		//Rotina Semantica 0
		//Algo vai ser definido -> , voltar para os estados da pilha, gerar transição em vazio do ultimo estado para o estado 1, Esvazia a pilha
		//Transicao
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(NT), this.getCustomStateString(NT,this.stack[this.stack.length -1].stateCounter) );
		//limpeza da pilha
		this.stack=[];
		//Voltar para os estados
		this.currentState = 0;
		this.stateCounter = 1;
	}

	foundNT(NT){
		//Rotina Semantica 1
		//Precisamos empilhar o estado atual e o contador, fazer um desvio para o estado inicial do NT -> theNT_s0
		//Vamos adotar a seguinte estratégia. Se o NT já foi definido teremos o estado dele. Caso contrário a gente delega cria só o estado inicial e finge q ja temos aquilo.
		//Problema.  como o estado final de la vai saber que deve retornar pra ca qnd terminar de pegar lá?
		// O PONTO NO FIM DA DEFINIçÂO ! A GENTE VAI RECER A CONTINUAção DA DEFINICAO, SE FOR PONTO TERIMOS Q VOLTAR PARA O INICIO DE QL QR JEITO, SE NAO FOR VOLTA PRO ESTADO ANTERIOR DA PILHA E VAI EMBORA !


		//1- Empilha o estado atual
		this.stackMe();
		//2- Desvia para o o estado inicial da submaquina que queremos(ou seja, cria uma transiçao).
		//TODO: CHECAR SE O ESTADO INICIAL DE ACEITACAO VAI SER 0 OU 1.
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(), NT + '_s0' );
		//3-Avança como se não houvesse amanhã _> Para o
		this.currentState = 0;
		this.goToNextState(NT);
	}

	goToNextState(NT){
		
		if(this.statesMap[this.getCurrentStateString(NT)]){
			if(!this.statesMap[this.getNextStateString(NT)]){
				//Next State is not defined, create it
				this.statesMap[this.getNextStateString(NT)] = [];
			}
			//go to the state
			this.currentState = this.stateCounter;
			this.stateCounter += 1;
			return ;
		}
		throw new Error('We tried to advance in a next State without even being on an existing state on the map.currentState: ' + this.currentState +' |stateCounter: '+ this.stateCounter);
	}

	foundT(terminal){
		//Rotina Semantica 1
		//Consumir o terminal e passar pra frente
		this.addStateToMapAndCreateSimpleTransition(terminal,this.getCurrentStateString(), this.getNextStateString());
		//Passar o estado corrente para o novo
		this.goToNextState();
	}

	foundEmpty(){
		//Rotina Semantica 1
		this.addStateToMapAndCreateSimpleTransition(null,this.getCurrentStateString(), this.getNextStateString());
		//Passar o estado corrente para o novo
		this.goToNextState();
	}

	getCustomStateString(customSubmachine,number){
		return (customSubmachine || this.subMachineType ||'') + '_s' + number;
	}

	getCurrentStateString(customSubmachine){
		console.log(this.statesMap);
		return this.getCustomStateString(customSubmachine, this.currentState);
	}

	getNextStateString(customSubmachine){
		return this.getCustomStateString(customSubmachine, this.stateCounter);
	}

	popStack(){
		const machineStateToGo = this.stack[this.stack.length -1];
		this.currentState = machineStateToGo.currentState;
		this.stateCounter = machineStateToGo.stateCounter;
		this.stack.pop();
	}

	stackMe(){
		this.stackCustom(this.currentState,this.stateCounter);
	}

	stackCustom(current, counter){
		this.stack = [...this.stack, {currentState: current, stateCounter: counter}];
	}

	newScopeDefined(){
		//Rotina Semantica 2
		//Ira ocorrer quando achamos um '=' ou um '(' que NÃO sejam STRING ( só pegar if token !== string e word === '=' || word == '(' )
		//Mantemos o estado atual
		//1-Epilhamos
		this.stackMe();
		//2-Incrementamos o contador
		this.stateCounter += 1;
	}

	getMap(){
		return this.statesMap;
	}

	getTrans(){
		return this.transitionsMap;
	}

	newScopedSetOfElements(NT){
		//Rotina Semantica 3
		//Ocorre quando achamos um '[' não string
		//Mantem o estado corrente
		//1-Cria transição em vazio do estado Corrente para o representado pelo contador
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(NT), this.getNextStateString(NT));
		//2-Empilha 
		this.stackMe();
		//3-Incrementa o contador( sem andar )
		this.stateCounter += 1;
	}

	newScopedRepeatedSetOfElements(NT){
		//Rotina Semantica 4
		//Ocorre quando achamos um '{' não string
		//Mantem o estado corrente
		//1-Cria transição em vazio do estado Corrente para o representado pelo contador
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(NT), this.getNextStateString(NT));
		//2-Avança para o estado do contador
		this.goToNextState();
		//3-Empilha 
		this.stackCustom(this.currentState, this.currentState);
		//4-Incrementa o contador( sem andar )
		this.stateCounter += 1;
	}
	
	endScoped(NT){
		//Rotina Semantica 5
		//1-Cria transição em vazio do estado Corrente para o empilhado como o proximo do contador
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(NT), this.getCustomStateString(NT, this.stack[this.stack.length - 1].stateCounter));
		//2-Vai para esse mesmo estado.
		this.currentState = this.stack[this.stack.length - 1].stateCounter;
		this.popStack();
	}

	endOfOption(NT){
		//Rotina Semantica 6
		//1-Cria transição em vazio do estado Corrente para o empilhado como o proximo do contador
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(NT), this.getCustomStateString(NT, this.stack[this.stack.length - 1].stateCounter));
		//2-Estado corrente vira o da esquerda do topo da pilha e NAO desempilha
		this.currentState = this.stack[this.stack.length -1].currentState;
	}

	endOfExternalScope(NT){
		//Rotina Semantica 7
		//1-Cria transição em vazio do estado Corrente para o empilhado como o proximo do contador
		this.addStateToMapAndCreateSimpleTransition(null, this.getCurrentStateString(NT), this.getCustomStateString(NT, this.stack[this.stack.length - 1].stateCounter));
		//2-Estado corrente vira o da direita do topo da pilha
		this.currentState = this.stack[this.stack.length -1].stateCounter;
		//3-Retorno de submaquina ( vou fazer com que quando recebemos algo não esperado (caso: esperamos um ponto pra acabar a definição. Se não vier um ponto nos desempilhamos.(tipo um caso de retorno de submaquina do recognizer)))
		//TODO: Fazer 3
		//4-Desempilhar
		this.popStack();
	}

	//TODO: Verificar se não rola guardar o NT do momento para não precisar ficar passando ele o tempo todo (acho q nao pq podemos ter um dentro do outro e isso causaria problemas)



}

module.exports = {
	StateMachineCreator,
};