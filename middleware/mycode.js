'use strict';

var Constants = require('./constants.js');
var ClientUtils = require('./clientUtils.js');
var createChannel = require('./create-channel.js');
var joinChannel = require('./join-channel.js');
var installCC = require('./install-chaincode.js');
var instantiateCC = require('./instantiate-chaincode.js');
var invokeCC = require('./invoke-chaincode.js');
var queryCC = require('./query-chaincode.js');

var tradeID = '6969420';





invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestTrade', [tradeID,"6000","CU CAI"], 'Importer')
.then(() => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INVOCATION COMPLETE');
	console.log('requestTrade SUCCEEDED');
	console.log('------------------------------');
	console.log('\n');

	// QUERY: getTradeStatus (Importer)
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getTradeStatus', [tradeID], 'Importer');
}, (err) => {
	console.log('\n');
	console.log('-----------------------------');
	console.log('CHAINCODE INVOCATION FAILED:', err);
	console.log('requestTrade FAILED');
	console.log('-----------------------------');
	console.log('\n');
	process.exit(1);
})
.then((result) => {
	console.log('\n');
	console.log('-------------------------');
	console.log('CHAINCODE QUERY COMPLETE');
	console.log('getTradeStatus VALUE:', result);
	console.log('-------------------------');
	console.log('\n');

	// INVOKE: requestLC (Importer)
	// return invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestLC', [tradeID], 'Importer');
});