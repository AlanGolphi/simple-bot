module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: 'standard-with-typescript',
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	rules: {
		indent: 0,
		'no-tabs': 0,
		'no-plusplus': 0,
		'no-await-in-loop': 0,
		'no-extra-semi': 0,
		semi: [2, 'always']
	}
};
