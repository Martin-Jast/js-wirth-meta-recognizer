

const CHARACTER_EXTRACTOR = {
	//TODO: Trocar pelos corretos
	END_OF_FILE: 'EOF',
	END_OF_LINE: 'EOL',
	IDENTIFIER: 'identifier',
	QUOTE_MARK: 'quote',
	SPECIAL: 'special',
	ERROR: 'no_bussines',
};
const RESERVED_CHARS = ['{', '}', '[', ']', '(', ')', '"', '.', '=', '|'];

// This is following the same states as shown in the slides
// We will define states by it's name and the transitions it follows
const WIRTH_STATE_MACHINE = {
	'START' : ['NT_DEF_START'],
	'NT_DEF_START' : ['EXP_PRECEDENT'],
	'EXP_PRECEDENT' : ['AFTER_EXP'],
	'AFTER_EXP' : ['AFTER_POINT_ACCEPTION'],
	'AFTER_POINT_ACCEPTION': ['NT_DEF_START'],
};

const EXP_STATE_MACHINE = {
	'EXP_START': ['ACCEPTED_EXP', 'OPEN_PARENTESIS', 'OPEN_BRACKET', 'OPEN_BRACES'],
	'ACCEPTED_EXP':['EXP_START','ACCEPTED_EXP', 'OPEN_PARENTESIS', 'OPEN_BRACKET', 'OPEN_BRACES'],

	// New Exp inside our exp
	'OPEN_PARENTESIS': ['POS_EXP_IN_PARENTESIS'],
	'OPEN_BRACKET': ['POS_EXP_IN_BRACKET'],
	'OPEN_BRACES': ['POS_EXP_IN_BRACES'],
	'POS_EXP_IN_PARENTESIS': ['ACCEPTED_EXP'],
	'POS_EXP_IN_BRACKET': ['ACCEPTED_EXP'],
	'POS_EXP_IN_BRACES': ['ACCEPTED_EXP'],
};

//Para colocar o contexto para o sintatico precisariamos colocar um "Tipo de nao terminal" diferente pra cada um desses caras
const NT = [
	CHARACTER_EXTRACTOR.IDENTIFIER,
	CHARACTER_EXTRACTOR.QUOTE_MARK
];

const EMPTY_TRANSITION = 'EMPTY_TRANSITION';

const TERM = [
	'GRAMMAR',
	'EXP'];

const WIRTH_TRANSFERENCE_FUNCTIONS = {
	'START' : [NT],
	'NT_DEF_START' : [['=']],
	'EXP_PRECEDENT' : [['EXP']],
	'AFTER_EXP' : [['.']],
	'AFTER_POINT_ACCEPTION': [NT]
};

const EXP_TRANSFERENCE_FUNCTIONS = {
	'EXP_START': [[...NT,...TERM,EMPTY_TRANSITION],['('],['['],['{']],
	'ACCEPTED_EXP':  [['|'],[...NT,...TERM,EMPTY_TRANSITION],['('],['['],['{']],

	// New Exp inside our exp
	'OPEN_PARENTESIS': [['EXP']],
	'OPEN_BRACKET': [['EXP']],
	'OPEN_BRACES': [['EXP']],
	'POS_EXP_IN_PARENTESIS': [[')']],
	'POS_EXP_IN_BRACKET': [[']']],
	'POS_EXP_IN_BRACES': [['}']],
};

const GLOBAL_TRANSFERENCE_FUNCTIONS = {
	...WIRTH_TRANSFERENCE_FUNCTIONS,
	... EXP_TRANSFERENCE_FUNCTIONS
};

const GLOBAL_STATE_MAPS = {
	...WIRTH_STATE_MACHINE,
	...EXP_STATE_MACHINE,
};

const ACCEPTION_STATES = [
	'AFTER_POINT_ACCEPTION',
	'ACCEPTED_EXP'
];


module.exports={
	NT,
	TERM,
	ACCEPTION_STATES,
	EMPTY_TRANSITION,
	CHARACTER_EXTRACTOR,
	EXP_STATE_MACHINE,
	GLOBAL_TRANSFERENCE_FUNCTIONS,
	GLOBAL_STATE_MAPS,
};
