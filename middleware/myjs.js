'use strict';

var Constants = require('./constants.js');
var ClientUtils = require('./clientUtils.js');
var createChannel = require('./create-channel.js');
var joinChannel = require('./join-channel.js');
var installCC = require('./install-chaincode.js');
var instantiateCC = require('./instantiate-chaincode.js');
var invokeCC = require('./invoke-chaincode.js');
var queryCC = require('./query-chaincode.js');

var tradeID = 'idcheck05';


function phase1(){
	invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestTrade', [tradeID,'10-10-2040','Wood for Toys','100','02-12-2019','California'], 'Importer')
	.then(() => {
		// console.log('\n');
		// console.log('------------------------------');
		// console.log('CHAINCODE INVOCATION COMPLETE');
		// console.log('requestTrade SUCCEEDED');
		// console.log('------------------------------');
		// console.log('\n');

		// QUERY: getTradeStatus (Importer)
		return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'acceptTrade', [tradeID,'Exporter','50','USB'], 'Exporter');
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
		return invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'issueLC', [tradeID,'10-19-2019','12-19-2020'], 'Importer')
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
		return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'acceptLC', [tradeID], 'Exporter');
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
	.then(rs =>{
		console.log(rs);
		process.exit(1);
	})
}

function phase2(){
	invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestCustomsDeclaration', [tradeID,'02-09-2019', 'tran dan', 'con cac', 'NYC'], 'Exporter')
	.then(() => {
		console.log('\n');
		console.log('------------------------------');
		console.log('REQUEST CD OK ');
		console.log('------------------------------');
		console.log('\n');
		return invokeCC.invokeChaincode(Constants.REGULATOR_ORG, Constants.CHAINCODE_VERSION, 'acceptCustomsDeclaration', [tradeID,'100'], 'Regulator');
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('REQUEST CD FAILED:', err);
		console.log('------------------------------');
		console.log('\n');
		process.exit(1);
	})
	.then(() => {
		return invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'payForCustomsDeclaration', [tradeID], 'Exporter');
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('ACCEPT CD FAILED:CHAINCODE INSTANTIATE ', err);
		console.log('------------------------------');
		console.log('\n');
		process.exit(1);
	})
	.then(() => {
		return queryCC.queryChaincode(Constants.REGULATOR_ORG, Constants.CHAINCODE_VERSION, 'getAccountBalance', ['Regulator']);
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('PAY FOR CD FAILED:', err);
		console.log('------------------------------');
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

		process.exit(1);
	});

}

function phase3(){
	invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'prepareShipment', [tradeID], 'Exporter')
	.then(() => {
		return invokeCC.invokeChaincode(Constants.CARRIER_ORG, Constants.CHAINCODE_VERSION, 'acceptShipmentAndIssueBL', [tradeID,'09-18-2019','09-18-2020','Tàu màu đỏ','50000','PREPAID','HCMC','NYC'], 'Carrier');
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('PREPARE SHIPMENT FAILED:', err);
		console.log('------------------------------');
		console.log('\n');
		process.exit(1);
	})
	.then(() => {
		return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getAccountBalance', [tradeID], 'Exporter');
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('ACCEPT SHIPMENT FAILED:', err);
		console.log('------------------------------');
		console.log('\n');
		process.exit(1);
	})
	.then(rs =>{
		console.log(rs);
		process.exit(1);
	});
}

function phase4(){
	invokeCC.invokeChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'requestPayment', [tradeID], 'Exporter')
	.then(() => {
		return invokeCC.invokeChaincode(Constants.IMPORTER_ORG, Constants.CHAINCODE_VERSION, 'makePayment', [tradeID], 'Importer');
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('REQUEST PAYMENT FAILED:', err);
		console.log('------------------------------');
		console.log('\n');
		process.exit(1);
	})
	.then(() => {
		return queryCC.queryChaincode(Constants.EXPORTER_ORG, Constants.CHAINCODE_VERSION, 'getAccountBalance', [tradeID], 'Exporter');
	}, (err) => {
		console.log('\n');
		console.log('------------------------------');
		console.log('MAKE PAYMENT FAILED:', err);
		console.log('------------------------------');
		console.log('\n');
		process.exit(1);
	})
	.then(rs =>{
		console.log(rs);
		process.exit(1);
	});
}

function test(){
	// invokeCC.invokeChaincode(Constants.REGULATOR_ORG, Constants.CHAINCODE_VERSION, 'updateShipmentLocation',[tradeID,'DESTINATION'],'Regulator')
	// .then(()=>{
	// 	console.log("UPDATE LOCATION OK");
	// 	return invokeCC.invokeChaincode(Constants.CARRIER_ORG, Constants.CHAINCODE_VERSION, 'requestShippingFee',[tradeID],'Carrier');
	// }, err =>{
	// 	console.log(err);
	// })
	// .then (()=>{
	// 	console.log("REQUEST OK");
	// 	return invokeCC.invokeChaincode(Constants.IMPORTER_ORG,Constants.CHAINCODE_VERSION, 'payForShippingFee',[tradeID],'Importer');
	// }, (err)=>{
	// 	console.log(err);
	// })
	// .then(()=>{
	// 	console.log("PAY OK");
	// 	return queryCC.queryChaincode(Constants.CARRIER_ORG,Constants.CHAINCODE_VERSION, 'getAccountBalance',[tradeID],'Carrier');
	// }, err =>{
	// 	console.log(err);
	// })
	// .then(rs =>{
	// 	console.log(rs);
	// 	process.exit(1);
	// })

	queryCC.queryChaincode(Constants.IMPORTER_ORG,Constants.CHAINCODE_VERSION, 'getShippingFeeStatus',[tradeID],'Importer')
	.then(rs =>{
		console.log(rs);
	}, err =>{
		console.log(err);
	})
}

var opts = process.argv.slice(2);
// console.log(opts)
if (opts[0] == undefined){
	console.log("Có súng đây nè!");
	return;
}
switch (opts[0]){
	case '1':
		phase1();
		break;
	case '2':
		phase2();
		break;
	case '3':
		phase3();
		break;
	case '4':
		phase4();
		break;
	case 'test':
		test();
		break;
	default:
		console.log("Tui xin tự giới thiệu tui là đệ nhứt Quốc sư Hoa Kỳ, cố dấn tối cao của tổng thống Mỹ Donald Trump.");
		return;
}
