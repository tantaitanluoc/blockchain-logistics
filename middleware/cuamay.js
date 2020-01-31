'use strict';

var Constants = require('./constants.js');
var ClientUtils = require('./clientUtils.js');
var createChannel = require('./create-channel.js');
var joinChannel = require('./join-channel.js');
var installCC = require('./install-chaincode.js');
var instantiateCC = require('./instantiate-chaincode.js');
var invokeCC = require('./invoke-chaincode.js');
var queryCC = require('./query-chaincode.js');

var tradeID = 'idcheck8003';


invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestTrade', [tradeID,'10-10-2040','Wood for Toys','100','02-12-2019','California'], 'nathan97')
.then(() => {
	// console.log('\n');
	// console.log('------------------------------');
	// console.log('CHAINCODE INVOCATION COMPLETE');
	// console.log('requestTrade SUCCEEDED');
	// console.log('------------------------------');
	// console.log('\n');

	// QUERY: getTradeStatus (Importer)
	return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'acceptTrade', [tradeID,'Importer','50','USB'], 'Exporter');
}, (err) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INSTANTIATE FAILED:', err);
	console.log('------------------------------');
	console.log('\n');
	process.exit(1);
})
.then(() => {
	// console.log('\n');
	// console.log('------------------------------');
	// console.log('CHAINCODE INVOCATION COMPLETE');
	// console.log('requestTrade SUCCEEDED');
	// console.log('------------------------------');
	// console.log('\n');

	// QUERY: getTradeStatus (Importer)
	return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getTradeStatus', [tradeID], 'Exporter');
}, (err) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INSTANTIATE FAILED:', err);
	console.log('------------------------------');
	console.log('\n');
	process.exit(1);
})
.then((rs) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE 	query COMPLETE');
	console.log('rs:', rs);
	console.log('------------------------------');
	console.log('\n');

	// QUERY: getTradeStatus (Importer)
	return invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestLC', [tradeID,'sdjfasodifjsdo'], 'Importer');
}, (err) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INSTANTIATE FAILED:', err);
	console.log('------------------------------');
	console.log('\n');
	process.exit(1);
})

.then(() => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INVOCATION COMPLETE');
	console.log('requestLC SUCCEEDED');
	console.log('------------------------------');
	console.log('\n');

	// QUERY: getTradeStatus (Importer)
	return invokeCC.invokeChaincode(Constants.IMPORTERBANK_ORG, Constants.CHAINCODE_VERSION, 'issueLC', [tradeID,'10-19-2019','12-19-2020'], 'Importerbank')
}, (err) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INSTANTIATE FAILED:', err);
	console.log('------------------------------');
	console.log('\n');
	process.exit(1);
})
.then(() => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INVOCATION COMPLETE');
	console.log('requestTrade SUCCEEDED');
	console.log('------------------------------');
	console.log('\n');

	// QUERY: getTradeStatus (Importer)
	return invokeCC.invokeChaincode(Constants.EXPORTERBANK_ORG, Constants.CHAINCODE_VERSION, 'acceptLC', [tradeID], 'Exporterbank');
}, (err) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INSTANTIATE FAILED:', err);
	console.log('------------------------------');
	console.log('\n');
	process.exit(1);
})
// // Invoke a trade request operation on the chaincode
.then(() => {
	console.log('\n');
	console.log('------------------------------');
	console.log('CHAINCODE INVOCATION COMPLETE');
	console.log('acceptTrade SUCCEEDED');
	console.log('------------------------------');
	console.log('\n');

	return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getLCStatus', [tradeID], 'Exporter');
	
}, (err) => {
	console.log('\n');
	console.log('-----------------------------');
	console.log('CHAINCODE INVOCATION FAILED:', err);
	console.log('-----------------------------');
	console.log('\n');
	process.exit(1);
})
.then((result) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('GET TRADE STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');

	return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestEL', [tradeID], 'Exporter');
}, (err) => {
	console.log('\n');
	console.log('-----------------------------');
	console.log('CHAINCODE INVOCATION FAILED:', err);
	console.log('-----------------------------');
	console.log('\n');
	process.exit(1);
})
.then((result) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('GET TRADE STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');

	return invokeCC.invokeChaincode(Constants.REGULATOR_ORG, Constants.CHAINCODE_VERSION, 'issueEL', [tradeID,'02-20-2020'], 'Regulator');
}, (err) => {
	console.log('\n');
	console.log('-----------------------------');
	console.log('CHAINCODE INVOCATION FAILED:', err);
	console.log('-----------------------------');
	console.log('\n');
	process.exit(1);
})
.then(() => {
	console.log('\n');
	console.log('------------------------------');
	console.log('REQUEST LC COMPLETE');
	console.log('------------------------------');
	console.log('\n');

	return queryCC.queryChaincode(Constants.REGULATOR_ORG, Constants.CHAINCODE_VERSION, 'getELStatus', [tradeID], 'Regulator');
	
}, (err) => {
	console.log('\n');
	console.log('-----------------------------');
	console.log('CHAINCODE QUERY FAILED:', err);
	console.log('-----------------------------');
	console.log('\n');
})
.then((result) => {
	console.log('\n');
	console.log('------------------------------');
	console.log('GET EL STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');

	return invokeCC.invokeChaincode(Constants.EXPORTER_ORG , Constants.CHAINCODE_VERSION, 'requestCustomsDeclaration', [tradeID, "11-11-2020", "export", "trading",  "California"], 'Exporter')
})
.then(() => {
	return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getCDStatus', [tradeID],'Exporter')
})
.then((result) =>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET CD STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(() => {
	return invokeCC.invokeChaincode(Constants.REGULATOR_ORG, Constants.CHAINCODE_VERSION, 'acceptCustomsDeclaration', [tradeID,"200"], "Regulator" )
})
.then(()=> {
	return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'payForCustomsDeclaration', [tradeID], "Exporter" )
})
.then(() => {
	return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getCDStatus', [tradeID],'Exporter')
})
.then((result) =>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET CD STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(()=> {
	 return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'prepareShipment',[tradeID],'Exporter')
}).then(()=> {
	console.log('\n');
	console.log('------------------------------------------------------------------------------------\n');
})
.then(() => {
	return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getShipmentLocation',[tradeID],'Exporter')
})
.then((result) =>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET SHIP STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(()=> {
	return invokeCC.invokeChaincode(Constants.CARRIER_ORG, Constants.CHAINCODE_VERSION, 'acceptShipmentAndIssueBL',[tradeID, '10-10-2020', '11-11-2020', 'full', '400', 'PREPAID', 'CatLat', 'California'],'Carrier')
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getAccountBalance',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET Account COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(() => {
	return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestPayment',[tradeID],'Exporter')
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getPaymentStatus',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET payment status COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(() => {
	return invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'makePayment',[tradeID],'Importer')
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getPaymentStatus',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET payment status COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getAccountBalance',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET Account COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
	
})
.then(() => {
	return invokeCC.invokeChaincode(Constants.CARRIER_ORG, Constants.CHAINCODE_VERSION, 'updateShipmentLocation',[tradeID,"DESTINATION"],'carrier')
})
.then(() => {
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getShipmentLocation',[tradeID],'importer')
})
.then((result) =>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET SHIP STATUS COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(() => {
	return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestPayment',[tradeID],'Exporter')
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getPaymentStatus',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET payment status COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(() => {
	return invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'makePayment',[tradeID],'Importer')
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getPaymentStatus',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET payment status COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
})
.then(()=>{
	return queryCC.queryChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'getTradeStatus',[tradeID],'Importer')
})
.then((result)=>{
	console.log('\n');
	console.log('------------------------------');
	console.log('GET trade status COMPLETE');
	console.log('VALUE:', result);
	console.log('------------------------------');
	console.log('\n');
	
	process.exit(1);

	return "ok"	
})
