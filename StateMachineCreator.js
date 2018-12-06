const constants = require('./constants');

class StateMachineCreator{
	constructor(subMachineType, statesMap, transitionsMap, NT){
		this.stateCounter = 0;
		this.currentState = (subMachineType||'') + '_s0';
		this.startingState = this.currentState;
		this.endingState = this.endingState;
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
			[...this.statesMap[fromState], toState] : [];
                
		//Add to Transitions
		const transitionIndex = this.statesMap[fromState].indexOf(toState);
		if(transitionIndex === -1){
			this.transitionsMap[fromState][transitionIndex] = [];
		} 
		this.transitionsMap[fromState][transitionIndex].push(consumed || constants.EMPTY_TRANSITION);
		//Increase Number of States
		this.stateCounter+=1;
	}

	startEndRule(){
		this.stack = [];
		this.currentState = (this.subMachineType||'') + '_s0';
		this.endingState = (this.subMachineType||'') + '_s' + this.stateCounter;
    	this.addStateToMapAndCreateSimpleTransition(null, (this.subMachineType||'') + '_s0', (this.subMachineType||'') + '_s' + this.stateCounter);
	}

	transition(consumedWord){
		//Se houver uma pilha ela que deve comsumir
		if(this.stack.length > 0){
			const stackReponse =  this.stack[this.stack.length-1].transition(consumedWord);
            
			return stackReponse;
		}
		// Checar essa parte do quote mark.
		if(consumedWord.token === constants.CHARACTER_EXTRACTOR.QUOTE_MARK) return;
		if(constants.NT.includes(consumedWord.token) || consumedWord === constants.EMPTY_TRANSITION){
			//Simple case is a transition with consumption
			this.addStateToMapAndCreateSimpleTransition(consumedWord.word , this.currentState, (this.subMachineType||'') + '_s'+ this.stateCounter);
			return ;
		}else{
			//Create an end point
			this.statesMap[this.currentState] = this.statesMap[this.currentState] ? 
				[...this.statesMap[this.currentState], (this.subMachineType||'') + '_s'+ this.stateCounter] : [];
			this.stateCounter += 1;
			// Create a subMachine.
			this.stack.push(new StateMachineCreator(consumedWord.word,null,null,this.NT));
			return this.transition(consumedWord);
		}
	}
    

    



}

module.exports = {
	StateMachineCreator,
};