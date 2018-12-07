
const RESERVED_CHARS = ['{', '}', '[', ']', '(', ')', '"', '.', '=', '|'];

const CHARACTER_EXTRACTOR = {
	//TODO: Trocar pelos corretos
	END_OF_FILE: 'EOF',
	END_OF_LINE: 'EOL',
	IDENTIFIER: 'Identifier',
	NUMBER: 'Number',
	QUOTE_MARK: 'quote',
	STRING: 'String',
	SPECIAL: 'special',
	ERROR: 'no_bussines',
	DIGIT: 'Digit',
	LETTER: 'Character',
	DELIMITER: 'Delimiter',
};
const DIGIT = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const LETTERS = ['a','b','c','d','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','y','z',
	'A','B','C','D','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','Y','Z'];
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

const WIRTH_NON_TERMINALS = [
	'GRAMMAR',
	'EXP'
];

const NT = [
	CHARACTER_EXTRACTOR.IDENTIFIER,
	...WIRTH_NON_TERMINALS	
];

const EMPTY_TRANSITION = 'EMPTY_TRANSITION';

const TERM = [
	CHARACTER_EXTRACTOR.STRING,
	CHARACTER_EXTRACTOR.QUOTE_MARK,
	...DIGIT,
	...LETTERS,
];

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
	RESERVED_CHARS,
	EMPTY_TRANSITION,
	CHARACTER_EXTRACTOR,
	EXP_STATE_MACHINE,
	GLOBAL_TRANSFERENCE_FUNCTIONS,
	GLOBAL_STATE_MAPS,
};
