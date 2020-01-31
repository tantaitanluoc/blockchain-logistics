package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type LogisticsChaincode struct {
}

func UpdateStep(stub shim.ChaincodeStubInterface, tradeID string, step string) sc.Response {
	var trade_key string
	var trade_agreement *TradeAgreement
	var trade_agreement_in_bytes []byte
	var err error

	trade_key, err = getTradeKey(stub, tradeID)
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement_in_bytes, err = stub.GetState(trade_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	// update process
	trade_agreement.LatestStep = step

	trade_agreement_in_bytes, err = json.Marshal(trade_agreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	err = stub.PutState(trade_key, trade_agreement_in_bytes)
	if err != nil {
		return shim.Error("Error while recording trade agreement infomation")
	}

	return shim.Success(nil)
}

func (l *LogisticsChaincode) Init(stub shim.ChaincodeStubInterface) sc.Response {

	fmt.Println("------------------------------")
	fmt.Println("| Starting logistics network |")
	fmt.Println("------------------------------")

	_, args := stub.GetFunctionAndParameters()
	lenArgs := len(args)
	if lenArgs == 0 {
		return shim.Success(nil)
	}

	//check count of arguments of initiate state
	if lenArgs != 10 {
		err := errors.New(fmt.Sprintf("Incorrect number of arguments. Expect 10\n" +
			"{\n" +
			"	Exporter, \n" +
			"	Exporter's Bank, \n" +
			"	Exporter's Account Balance, \n" +
			"	Importer, \n" +
			"	Importer's Bank, \n" +
			"	Importer's Account Balance, \n" +
			"	Carrier, \n" +
			"	Carrier's Account Balance, \n" +
			"	Regulatory Authority,\n" +
			"	Regulatory's Account Balance \n" +
			"}\n"))
		return shim.Error(err.Error())
	}

	//check balance type of exporter & importer
	_, err := strconv.Atoi(string(args[2]))
	if err != nil {
		err = errors.New("Account balance of Export must be positive (>0), but " + args[2])
		return shim.Error(err.Error())
	}

	_, err = strconv.Atoi(string(args[5]))
	if err != nil {
		err := errors.New("Account balance of import must be positive (>0), but " + args[5])
		return shim.Error(err.Error())
	}

	_, err = strconv.Atoi(string(args[7]))
	if err != nil {
		err := errors.New("Account balance of import must be positive (>0), but " + args[7])
		return shim.Error(err.Error())
	}

	_, err = strconv.Atoi(string(args[9]))
	if err != nil {
		err := errors.New("Account balance of import must be positive (>0), but " + args[9])
		return shim.Error(err.Error())
	}

	//show argument of initiate state
	fmt.Sprintln("Arguments\n" +
		"{\n" +
		"	Exporter: " + args[0] + ",\n" +
		"	Exporter's Bank: " + args[1] + ",\n" +
		"	Exporter's Account Balance: " + args[2] + ",\n" +
		"	Importer: " + args[3] + ",\n" +
		"	Importer's Bank: " + args[4] + ",\n" +
		"	Importer's Account Balance: " + args[5] + ",\n" +
		"	Carrier: " + args[6] + ",\n" +
		"	Carrier's Account Balance: " + args[7] + ",\n" +
		"	Regulatory Authority: " + args[8] + ",\n" +
		"	Regulatory's Account Balance: " + args[9] + "\n" +
		"}\n")

	// Map participant identities to their roles on the ledger

	roleKeys := []string{expKey, ebKey, expBalKey, impKey, ibKey, impBalKey, carKey, carBalKey, raKey, raBalKey}
	for i, roleKey := range roleKeys {
		err = stub.PutState(roleKey, []byte(args[i]))
		if err != nil {
			fmt.Errorf("Error recording key %s: %s\n", roleKey, err.Error())
			return shim.Error(err.Error())
		}
	}

	return shim.Success(nil)

}
func (l *LogisticsChaincode) Invoke(stub shim.ChaincodeStubInterface) sc.Response {
	var creatorOrg, creatorCertIssuer string
	var err error

	creatorOrg, creatorCertIssuer, err = getCreatorInfo(stub)

	if err != nil {
		fmt.Errorf("Error extracting creator identity info: %s\n", err.Error())
		return shim.Error(err.Error())
	}
	fmt.Printf("LogisticsChaincode invoked by '%s', '%s'\n", creatorOrg, creatorCertIssuer)

	fcn, args := stub.GetFunctionAndParameters()

	switch fcn {
	case "requestTrade":
		return l.requestTrade(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, issueDate, descriptionsOfGood, amountOfGood, timeCompletedShipment, placeToShipment)
	case "acceptTrade":
		return l.acceptTrade(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, payForShipmemnt, pricePerGoods, Currency)
	case "requestLC":
		return l.requestLC(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, Documents)
	case "issueLC":
		return l.issueLC(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, issueDate, ExpireDate)
	case "acceptLC":
		return l.acceptLC(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "requestEL":
		return l.requestEL(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "issueEL":
		return l.issueEL(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, expireDate)
	case "prepareShipment":
		return l.prepareShipment(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "acceptShipmentAndIssueBL":
		return l.acceptShipmentAndIssueBL(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, issueDate, ExpireDate, DescriptionsCarrier, feeOfShipment, NoteOfPayment, sourcePort, destinationPort)
	case "payForPreShippingFee":
		return l.payForPreShippingFee(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "requestCustomsDeclaration":
		return l.requestCustomsDeclaration(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, issueDate, typeOfPaper, reasonOfTrade,  sourcePort)
	case "acceptCustomsDeclaration":
		return l.acceptCustomsDeclaration(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, feeOfProcess)
	case "payForCustomsDeclaration":
		return l.payForCustomsDeclaration(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "updateShipmentLocation":
		return l.updateShipmentLocation(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID, locationOfShip)
	case "requestPayment":
		return l.requestPayment(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "makePayment":
		return l.makePayment(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "requestCollectShippingFee":
		return l.requestCollectShippingFee(stub, creatorOrg, creatorCertIssuer, args)
	case "payForCollectShippingFee":
		return l.payForCollectShippingFee(stub, creatorOrg, creatorCertIssuer, args)
	case "getTradeStatus":
		return l.getTradeStatus(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "getLCStatus":
		return l.getLCStatus(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "getELStatus":
		return l.getELStatus(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "getBL":
		return l.getBL(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "getShipmentLocation":
		return l.getShipmentLocation(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, tradeID)
	case "getShippingFeeStatus":
		return l.getShippingFeeStatus(stub, creatorOrg, creatorCertIssuer, args)
	case "getAccountBalance":
		return l.getAccountBalance(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller, callerCA, nameOfORG)
	case "getCDStatus":
		return l.getCDStatus(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller,callerCA, tradeID)
	case "getPaymentStatus":
		return l.getPaymentStatus(stub, creatorOrg, creatorCertIssuer, args)
		//(stub, caller,callerCA, tradeID)
	case "getUserRole":
		return l.getUserRole(stub, creatorOrg, creatorCertIssuer, args)
	case "getAllRecords":
		return l.getAllRecords(stub, creatorOrg, creatorCertIssuer, args)

	default:
		return shim.Error("Invalid function name")
	}

}

func (l *LogisticsChaincode) getUserRole(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var value string
	var err bool
	value, err = getUserRole(stub, "role")

	if err == false {
		return shim.Error("false to get role")
	}

	return shim.Success([]byte(value))
}

func (l *LogisticsChaincode) requestTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key string
	var trade_agreement *TradeAgreement
	var TradeStatus *TradeProcess
	var trade_agreement_in_bytes []byte
	var amount int
	var err error

	if !checkImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer can make a trade request")
	}

	if !checkManager(stub) {
		return shim.Error("Just manager can do this")
	}
	if len(args) != 6 {
		err = fmt.Errorf("Incorrect number of arguments. Expecting 6, Found %d", len(args))
		return shim.Error(err.Error())
	}

	trade_key, err = getTradeKey(stub, args[0])
	trade_agreement_in_bytes, err = stub.GetState(trade_key)
	if len(trade_agreement_in_bytes) != 0 {
		err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)
		if trade_agreement.Status == REQUESTED {
			err = fmt.Errorf("Trade '%s' [key: '%s'] is waiting for accept", trade_agreement.ID, trade_key)
			return shim.Error(err.Error())
		}
		if trade_agreement.Status == ACCEPTED {
			return shim.Error("TradeAgreement is complite")
		}
		return shim.Error("Unknow Error")
	}

	amount, err = strconv.Atoi(string(args[3])) // convert string sang int

	if err != nil {
		return shim.Error(err.Error())
	}
	exporter, err := stub.GetState(expKey)
	importer, err := stub.GetState(impKey)

	trade_agreement = &TradeAgreement{args[0], args[1], string(exporter), string(importer), args[2], amount, 0, "", 0, "", args[4], args[5],REQUEST_TRADE, REQUESTED} // tạo trade agreement với trạng thái là đã yêu cầu (requested)

	trade_agreement_in_bytes, err = json.Marshal(trade_agreement) // mã hóa thành kiểu JSON

	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	trade_key, err = getTradeKey(stub, args[0]) // generate trade key

	if err != nil {
		return shim.Error("Error while generating composite key " + err.Error())
	}

	err = stub.PutState(trade_key, trade_agreement_in_bytes) // ghi vào sổ cái

	if err != nil {
		return shim.Error("Error while recording data into ledger. " + err.Error())
	}

	TradeStatus = &TradeProcess{args[0], "RequestTrade"}

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Printf("Trade %s recorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) acceptTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var tradeKey string
	var tradeAgreement *TradeAgreement
	var tradeAgreementBytes []byte
	var err error

	//checking the access permission if creater is exporter?
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Caller not enough permission to accept the trade")
	}

	if !checkManager(stub) {
		return shim.Error("Just manager can do this")
	}

	//checking count of agrs input
	if len(args) != 4 {
		err = fmt.Errorf("Incorrect number of arguments. Expecting 4, Found %d", len(args))
		return shim.Error(err.Error())
	}

	//get tradeKey from network from arg
	tradeKey, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	//get trade agreement byte array from network
	tradeAgreementBytes, err = stub.GetState(tradeKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	//checking if tradeagreement exists
	if len(tradeAgreementBytes) == 0 {
		err = fmt.Errorf("No reccord found for %s", args[0])
		return shim.Error(err.Error())
	}

	//tranform agreement byte array to tradeAgreement type
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)

	// create accception
	if tradeAgreement.Status == ACCEPTED {
		fmt.Println(args[0] + " already accepted")
	} else {
		price, err := strconv.Atoi(args[2])
		tradeAgreement.Status = ACCEPTED
		tradeAgreement.PayForShipment = args[1]
		tradeAgreement.Price = price
		tradeAgreement.Currency = args[3]
		tradeAgreement.LatestStep = ACCEPT_TRADE
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling trade agreement structure")
		}
		err = stub.PutState(tradeKey, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "AcceptTrade"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Println("Accepting " + args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) requestLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key, lc_key string
	var trade_agreement_in_bytes, lc_in_bytes, exporter_in_bytes, exporter_bank_in_bytes []byte
	var trade_agreement *TradeAgreement
	var letter_of_credit *LetterofCredit
	var err error

	if !checkImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer can request for L/C")
	}

	if !checkManager(stub) {
		return shim.Error("Just manager can do this")
	}			

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	trade_key, err = getTradeKey(stub, args[0])

	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement_in_bytes, err = stub.GetState(trade_key) // lấy về thông tin hợp đồng từ sổ cái

	if err != nil {
		return shim.Error(err.Error())
	}

	if len(trade_agreement_in_bytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement) // json decode và lưu vào biến trade_agreement

	if err != nil {
		return shim.Error(err.Error())
	}

	if trade_agreement.Status != ACCEPTED {
		return shim.Error("Trade has not been acccepted by the parties")
	}

	lc_key, err = getLCKey(stub, args[0]) // generate key cho L/C
	if err != nil {
		return shim.Error(err.Error())
	}

	lc_in_bytes, err = stub.GetState(lc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(lc_in_bytes) != 0 {
		return shim.Error("L/C has already been requested")
	}

	exporter_in_bytes, err = stub.GetState(expKey) // lấy thông tin bên thụ hưởng
	if err != nil {
		return shim.Error(err.Error())
	}
	exporter_bank_in_bytes, err = stub.GetState(ebKey) // lấy thông tin bên thụ hưởng
	if err != nil {
		return shim.Error(err.Error())
	}

	letter_of_credit = &LetterofCredit{args[0], "", "", string(exporter_bank_in_bytes), string(exporter_in_bytes), trade_agreement.Amount, "", REQUESTED}

	lc_in_bytes, err = json.Marshal(letter_of_credit)
	if err != nil {
		return shim.Error("Error marshaling letter of credit structure")
	}


	err = stub.PutState(lc_key, lc_in_bytes) // ghi lên sổ cái
	if err != nil {
		return shim.Error("Error while recording data into ledger. " + err.Error())
	}
	
	UpdateStep(stub, args[0], REQUEST_LC)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "RequestLC"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Printf("L/C request for trade %s recorded.", args[0])
	return shim.Success(nil)

}

func (l *LogisticsChaincode) issueLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var lc_key string
	var lc_in_bytes []byte
	var letter_of_credit *LetterofCredit
	var err error
	var importerbankBalance int
	var trade_agreement *TradeAgreement

	if !checkImporterbankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer bank members can issue L/C")
	}

	if !checkManager(stub) {
		return shim.Error("only manager can issue lc")
	}

	if len(args) != 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 3. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	lc_key, err = getLCKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	lc_in_bytes, err = stub.GetState(lc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(lc_in_bytes, &letter_of_credit)
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_key, err := getTradeKey(stub, args[0])
	trade_agreement_in_bytes, err := stub.GetState(trade_key) // lấy về thông tin hợp đồng từ sổ cái

	if err != nil {
		return shim.Error(err.Error())
	}

	if len(trade_agreement_in_bytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)

	var tradeAmount = trade_agreement.Amount * trade_agreement.Price

	importerbankBalance_bytes, err := stub.GetState(impBalKey)

	err = json.Unmarshal(importerbankBalance_bytes, &importerbankBalance)

	if importerbankBalance < tradeAmount {
		return shim.Error(" Balance of the ImporterBank must be > trade amount*price")
	}

	if letter_of_credit.Status == ISSUED {
		fmt.Printf("L/C for trade %s is already issued", args[0])
	} else if letter_of_credit.Status == ACCEPTED {
		fmt.Printf("L/C for trade %s is already accepted", args[0])
	} else {
		letter_of_credit.IssDate = args[1]
		letter_of_credit.ExpDate = args[2]
		letter_of_credit.Status = ISSUED

		lc_in_bytes, err = json.Marshal(letter_of_credit)
		if err != nil {
			return shim.Error("Error marshaling L/C structure")
		}

		err = stub.PutState(lc_key, lc_in_bytes)
		if err != nil {
			return shim.Error(err.Error())
		}

		UpdateStep(stub, args[0], ISSUE_LC)
	}
	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "IssueLC"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Printf("L/C issuance %s has been recorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) acceptLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var lcKey string
	var letterOfCreditBytes[]byte
	var letterOfCredit *LetterofCredit
	var err error
	//check permission of caller
	if checkExporterbankOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Caller doesn't enough permission to accept LC, request exporter bank")
	}

	if !checkManager(stub) {
		return shim.Error("only manager can accept lc")
	}

	//check count of argument
	if len(args) != 1 {
		err = errors.New(fmt.Sprintln("Wrong number of arguments, expect 1"))
		return shim.Error(err.Error())
	}

	//get key of l/c from argument
	lcKey, err = getLCKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	//get l/c from network
	letterOfCreditBytes, err = stub.GetState(lcKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	// tranform l/c byte array to letterofCredit type
	err = json.Unmarshal(letterOfCreditBytes, &letterOfCredit)
	if err != nil {
		return shim.Error(err.Error())
	}

	//check l/c status and create acception
	if letterOfCredit.Status == ACCEPTED {
		fmt.Println(args[0] + " already accepted")
		return shim.Error(args[0] + " already accepted")
	} else if letterOfCredit.Status == REQUESTED {
		fmt.Println(args[0] + " waiting for issued complete")
		return shim.Error("L/C not issued yet")
	} else {
		letterOfCredit.Status = ACCEPTED
		letterOfCreditBytes, err = json.Marshal(letterOfCredit)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = stub.PutState(lcKey, letterOfCreditBytes)
		if err != nil {
			return shim.Error(err.Error())
		}


	}
	
	UpdateStep(stub, args[0], ACCEPT_LC)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "AcceptLC"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)
	fmt.Println("Accepting " + args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) requestEL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key, lc_key, el_key string
	var export_license *ExportLicense
	var trade_agreement *TradeAgreement
	var letter_of_credit *LetterofCredit
	var is_valid bool
	var trade_agreement_in_bytes, lc_in_bytes, el_in_bytes, exporter_in_bytes, carrier_in_bytes, approver_in_bytes []byte
	var err error

	if !checkExporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the exporter members can make a request for E/L")
	}

	if !checkManager(stub) {
		return shim.Error("Just manager can do this")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	lc_key, err = getLCKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	lc_in_bytes, err = stub.GetState(lc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(lc_in_bytes, &letter_of_credit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letter_of_credit.Status != ACCEPTED {
		fmt.Printf("L/C for trade %s has not been acccepted yet", args[0])
		return shim.Error("L/C has not been accepted")
	}

	is_valid, err = checkExpDate(letter_of_credit.ExpDate)
	if err != nil {
		return shim.Error("ExpDate is not a valid Date type: " + err.Error())
	}
	if !is_valid {
		return shim.Error("L/C is out of date.")
	}

	trade_key, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement_in_bytes, err = stub.GetState(trade_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(trade_agreement_in_bytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporter_in_bytes, err = stub.GetState(expKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	carrier_in_bytes, err = stub.GetState(carKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	approver_in_bytes, err = stub.GetState(raKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	export_license = &ExportLicense{args[0], "", string(exporter_in_bytes), string(carrier_in_bytes), trade_agreement.DescriptionofGoods, string(approver_in_bytes), REQUESTED}
	el_in_bytes, err = json.Marshal(export_license)
	if err != nil {
		return shim.Error("Error marshaling exporter license structure: " + err.Error())
	}

	el_key, err = getELKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(el_key, el_in_bytes)
	if err != nil {
		return shim.Error("Error while recording data into ledger: " + err.Error())
	}

	UpdateStep(stub, args[0], REQUEST_EL)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "RequestEL"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Printf("Export License request for trade %s successfully recorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) issueEL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var el_key string
	var el_in_bytes []byte
	var export_license *ExportLicense
	var err error

	if !checkRegulatorOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the Regulator members can issue E/L")
	}

	if len(args) != 2 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 2. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	el_key, err = getELKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	el_in_bytes, err = stub.GetState(el_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(el_in_bytes, &export_license)
	if err != nil {
		return shim.Error("Error unmarshaling exporter license structure: " + err.Error())
	}

	if export_license.Status == ISSUED {
		fmt.Printf("E/L for trade %s has already been issued.", args[0])
	} else {
		export_license.ExpDate = args[1]
		export_license.Status = ISSUED

		el_in_bytes, err = json.Marshal(export_license)
		if err != nil {
			return shim.Error("Error marshaling exporter license structure: " + err.Error())
		}
		err = stub.PutState(el_key, el_in_bytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	
	UpdateStep(stub, args[0], ISSUE_EL)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "IssueEL"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Printf("Export License issuance for trade %s successfully reccorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) prepareShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var elKey, shipmentLocationKey string
	var shipmentLocationBytes, exportLicenseBytes []byte
	var exportLicense *ExportLicense
	var is_valid bool
	var err error

	//check permission of caller
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Caller doesn't enough permission to prepare shipment")
	}

	if !checkManager(stub) {
		return shim.Error("Just manager can do this")
	}

	//count input argument
	if len(args) != 1 {
		err = errors.New(fmt.Sprintln("expect 1 from arguments"))
		return shim.Error(err.Error())
	}

	// get shipment location key from network
	shipmentLocationKey, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	// get shipment location from network
	shipmentLocationBytes, err = stub.GetState(shipmentLocationKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	//check status of shipment location
	if len(shipmentLocationBytes) != 0 {
		if string(shipmentLocationBytes) == SOURCE {
			fmt.Println("Shipment for trade " + args[0] + "has been already repair")
			return shim.Success(nil)
		} else {
			fmt.Println("Shipment for trade " + args[0] + " has been preparing")
			return shim.Error("Shipment for trade " + args[0] + " has been preparing")
		}
	}

	//check E/L of exporter from network
	elKey, err = getELKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	exportLicenseBytes, err = stub.GetState(elKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	//tranform E/L byte to E/L type
	err = json.Unmarshal(exportLicenseBytes, &exportLicense)
	if err != nil {
		return shim.Error(err.Error())
	}

	//check status of E/l
	if exportLicense.Status != ISSUED {
		fmt.Printf("E/L for trade %s has not been issued", args[0])
		return shim.Error("E/L not issued yet")
	}
	is_valid, err = checkExpDate(exportLicense.ExpDate)
	if err != nil {
		return shim.Error("ExpDate is not a valid Date type: " + err.Error())
	}
	if !is_valid {
		return shim.Error("E/L is out of date.")
	}

	shipmentLocationKey, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(shipmentLocationKey, []byte(SOURCE))
	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], PREPARE_SHIPMENT)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "PrepareShipment"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	fmt.Printf("Shipment preparation for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

func (l *LogisticsChaincode) acceptShipmentAndIssueBL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentLocationKey, blKey, tradeKey, note string
	var shipmentLocationBytes, tradeAgreementBytes, importerBytes, billOfLadingBytes, exporterBytes, carrierBytes, beneficiaryBytes []byte
	var billOfLading *BillofLading
	var tradeAgreement *TradeAgreement
	var err error
	var CD *CustomsDeclaration

	//check permission of caller
	if checkCarrierOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error(err.Error())
	}
	if !checkManager(stub) {
		return shim.Error("just manager can do that")
	}
	//check number of iput argument
	if len(args) < 7 {
		err = errors.New(fmt.Sprintln("Incorrect number of arguments, expect greater than 8, found " + strconv.Itoa(len(args))))
		return shim.Error(err.Error())
	}

	//check status of CD
	cdKey, err := getCDKey(stub, args[0])
	cdBytes, err := stub.GetState(cdKey)
	if err != nil {
		shim.Error("please request CD first")
	}
	err = json.Unmarshal(cdBytes, &CD)
	if err != nil {
		shim.Error("please request CD first")
	}
	if CD.Status != ACCEPTED {
		return shim.Error("Please prepare the Customs Declaration first")
	}

	//tranform input args to key in network
	shipmentLocationKey, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	//get bytes array of shipment location from network
	shipmentLocationBytes, err = stub.GetState(shipmentLocationKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	//check status of shipment
	if len(shipmentLocationBytes) == 0 {
		fmt.Println("Shipment for " + args[0] + " has not completed to prepare")
		return shim.Error("Shipment not prepare")
	}
	if string(shipmentLocationBytes) != SOURCE {
		fmt.Println("Shipment for " + args[0] + " has been prepared")
		return shim.Error("Shipment has been prepared")
	}

	//get tradeAgreement from network
	tradeKey, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	tradeAgreementBytes, err = stub.GetState(tradeKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		err = errors.New(fmt.Sprintln("No record found for " + args[0]))
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	//get infor of exporter, carrier, beneficary
	exporterBytes, err = stub.GetState(expKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	importerBytes, err = stub.GetState(impKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	carrierBytes, err = stub.GetState(carKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	beneficiaryBytes, err = stub.GetState(ibKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if err != nil {
		return shim.Error(err.Error())
	}
	fee, err := strconv.Atoi(args[4])

	switch args[5] {
	case "PREPAID":
		note = PREPAID
	case "TOCOLLECT":
		note = TOCOLLECT
	default:
		return shim.Error("Invalid shipping fee description, this value must be 'PREPAID' or 'TOCOLLECT', found '" + args[5] + "'.")
	}
	var listPort = args[6:]
	listPort = append(listPort, tradeAgreement.PlaceShipment)
	// create bill of lading object
	billOfLading = &BillofLading{args[0], args[1], args[2], string(exporterBytes), string(importerBytes), string(carrierBytes), args[3], tradeAgreement.DescriptionofGoods,
		tradeAgreement.Amount, string(beneficiaryBytes), tradeAgreement.PayForShipment, fee, note, CD.SourcePort, listPort, CD.DestinationPort , PAYREQUEST}

	billOfLadingBytes, err = json.Marshal(billOfLading)
	if err != nil {
		return shim.Error(err.Error())
	}

	blKey, err = getBLKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	//push bill of lading to network
	err = stub.PutState(blKey, billOfLadingBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], ACCEPT_SHIPMENT)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "AcceptShipmentAndIssueBL"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	var shipStatus *ShipStatus

	shipLCKey, err := getShipLocationKey(stub, args[0])

	shipStatus = &ShipStatus{args[0], SOURCE}

	ShipStatusBytes, err := json.Marshal(shipStatus)

	err = stub.PutState(shipLCKey, ShipStatusBytes)

	fmt.Println("B/L for trade " + args[0] + " is recorded")
	return shim.Success(nil)

}
func (l *LogisticsChaincode) payForPreShippingFee(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var BL_bytes []byte
	var BL_key, trade_key string
	var BL *BillofLading
	var trade *TradeAgreement
	var err error
	var shipping_fee_key, payer_key string
	var payer_balance_in_bytes, carrier_balance_in_bytes, trade_byte []byte
	var payerBalance, carBalance int

	if !checkExporterbankOrg(creatorOrg, creatorCertIssuer) && !checkImporterbankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the exporter and importer members can make payment request.")
	}
	if !checkAccounstancy(stub) {
		return shim.Error("Just accountant can do this")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintln("Incorrect number of arguments, expect 1, found " + strconv.Itoa(len(args))))
		return shim.Error(err.Error())
	}
	BL_key, err = getBLKey(stub, args[0])
	trade_key, err = getTradeKey(stub, args[0])
	BL_bytes, err = stub.GetState(BL_key)
	trade_byte, err = stub.GetState(trade_key)
	err = json.Unmarshal(BL_bytes, &BL)
	err = json.Unmarshal(trade_byte, &trade)

	if BL.Status != PAYREQUEST {
		return shim.Error("BL is not issue or had paid")
	}

	if BL.Note != PREPAID {
		return shim.Error("fee will be paid when the shipment complete")
	}

	shipping_fee_key, err = getShippingFeeKey(stub, args[0])

	if err != nil {
		return shim.Error(err.Error())
	}

	switch trade.PayForShipment {
	case impKey:
		payer_key = impBalKey
	case expKey:
		payer_key = expBalKey
	default:
		return shim.Error("Invalid 'PayForShipment' value in Trade Agreement, expecting '" + expKey + "' or '" + impKey + "', found: " + trade.PayForShipment)
	}

	payer_balance_in_bytes, err = stub.GetState(payer_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	payerBalance, err = strconv.Atoi(string(payer_balance_in_bytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	carrier_balance_in_bytes, err = stub.GetState(carBalKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	carBalance, err = strconv.Atoi(string(carrier_balance_in_bytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	payerBalance -= BL.FeeOfShipment
	carBalance += BL.FeeOfShipment

	err = stub.PutState(payer_key, []byte(strconv.Itoa(payerBalance)))
	if err != nil {
		return shim.Error("Error while recording payer balance: " + err.Error())
	}

	err = stub.PutState(carBalKey, []byte(strconv.Itoa(carBalance)))
	if err != nil {
		return shim.Error("Error while recording carrier balance: " + err.Error())
	}

	err = stub.PutState(shipping_fee_key, []byte(PAID))
	if err != nil {
		return shim.Error("Error while recording shipping key: " + err.Error())
	}

	BL.Status = PAID
	BL_bytes, err = json.Marshal(BL)
	err = stub.PutState(BL_key, BL_bytes)

	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], PAY_FOR_PREPAID)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "PayForPrepaidShippingFee"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)
}

func (l *LogisticsChaincode) requestPayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentlc_key, payment_key, trade_key string
	var shipmentlc_in_bytes, payment_in_bytes, trade_agreement_in_bytes []byte
	var trade_agreement *TradeAgreement
	var err error

	if !checkExporterbankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the Exporter Bank members can make payment request.")
	}

	if !checkAccounstancy(stub) {
		return shim.Error("Just accountant can do this")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	trade_key, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement_in_bytes, err = stub.GetState(trade_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(trade_agreement_in_bytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)
	if err != nil {
		return shim.Error("Error unmarshaling trade agreement structure: " + err.Error())
	}

	shipmentlc_key, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentlc_in_bytes, err = stub.GetState(shipmentlc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipmentlc_in_bytes) == 0 {
		fmt.Printf("Shipment for trade %s has not been prepare yet.", args[0])
		return shim.Error("Shipment not prepared yet.")
	}

	payment_key, err = getPaymentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	payment_in_bytes, err = stub.GetState(payment_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if string(payment_in_bytes) == PAID {
		return shim.Error("payment has been paid")
	}

	if string(payment_in_bytes) == PAYREQUEST {
		return shim.Error("payment is waiting for exercuse")
	}

	fmt.Printf("Amount paid for trade %s: %d ; total required: %d\n", args[0], trade_agreement.Paid, trade_agreement.Price*trade_agreement.Amount)
	if trade_agreement.Paid == trade_agreement.Price*trade_agreement.Amount { // Hóa đơn đã hoàn tất việc thanh toán
		fmt.Printf("Payment already settled for trade %s\n", args[0])
		return shim.Error("Payment already settled")
	}

	if string(shipmentlc_in_bytes) == SOURCE && trade_agreement.Paid != 0 { // Hóa đơn đã thanh toán một phần
		fmt.Printf("Partial payment already made for trade %s\n", args[0])
		return shim.Error("Partial payment already made")
	}

	err = stub.PutState(payment_key, []byte(PAYREQUEST))
	if err != nil {
		return shim.Error(err.Error())
	}

	if string(shipmentlc_in_bytes) != trade_agreement.PlaceShipment{
		UpdateStep(stub, args[0], REQUEST_HALF_PAYMENT)
	} else {
		UpdateStep(stub, args[0], REQUEST_LAST_PAYMENT)
	}

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "RequestPayment"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)
	fmt.Printf("Payment request for trade %s successfully recorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) requestCollectShippingFee(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipping_fee_key, shipmentlc_key, trade_key string
	var trade_agreement_in_bytes, shipmentlc_in_bytes, shipping_fee_in_bytes []byte
	var trade_agreement *TradeAgreement
	var err error

	if !checkCarrierOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the carrier members can make payment request.")
	}

	if !checkAccounstancy(stub) {
		return shim.Error("only accountant can do that")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	trade_key, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement_in_bytes, err = stub.GetState(trade_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(trade_agreement_in_bytes) == 0 {
		err = errors.New(fmt.Sprintf("No record found for trade ID %s", args[0]))
		return shim.Error(err.Error())
	}

	var BL *BillofLading
	BL_key, err := getBLKey(stub, args[0])
	BL_bytes, err := stub.GetState(BL_key)
	err = json.Unmarshal(BL_bytes, &BL)

	if BL.Status == PAID {
		return shim.Error("BL had been paid")
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)
	if err != nil {
		return shim.Error("Error unmarshaling trade agreement structure: " + err.Error())
	}

	shipmentlc_key, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentlc_in_bytes, err = stub.GetState(shipmentlc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipmentlc_in_bytes) == 0 {
		fmt.Printf("Shipment for trade %s has not been prepare yet.", args[0])
		return shim.Error("Shipment not prepared yet.")
	}

	shipping_fee_key, err = getShippingFeeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipping_fee_in_bytes, err = stub.GetState(shipping_fee_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if string(shipping_fee_in_bytes) == REQUESTED {
		return shim.Error("Payment request already pending for trade: " + args[0])
	}
	if string(shipping_fee_in_bytes) == PAID {
		return shim.Error("Shipping fee is already paid.")
	}

	err = stub.PutState(shipping_fee_key, []byte(REQUESTED))
	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], REQUEST_COLLECT_SHIPPING_FEE)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "RequestCollectShippingFee"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)
}

func (l *LogisticsChaincode) makePayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentLocationKey, paymentKey, tradeKey, bl_key string
	var paymentAmount, expBalance, impBalance int
	var shipmentLocationBytes, paymentBytes, tradeAgreementBytes, impBalanceBytes, expBalanceBytes, bl_in_bytes []byte
	var tradeAgreement *TradeAgreement
	var bill_of_lading *BillofLading
	var is_valid bool
	var err error

	//check permission of caller
	if !checkImporterbankOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Caller doesn't enough permission to execute")
	}

	if !checkAccounstancy(stub) {
		return shim.Error("Just accountant can do this")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintln("Incorrect count of argument input, expect 1, found " + strconv.Itoa(len(args))))
		return shim.Error(err.Error())
	}

	// change args to a key value in network
	paymentKey, err = getPaymentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	//get payment from network
	paymentBytes, err = stub.GetState(paymentKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(paymentBytes) == 0 {
		fmt.Println("No payment request for " + args[0])
		return shim.Error("No payment request found")
	}

	if string(paymentBytes) == PAID {
		return shim.Error("payment has been paid")
	}
	if string(paymentBytes) == HALFPAID {
		return shim.Error("payment need to request again to pay for remain")
	}

	tradeKey, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	// get trade agreement from network
	tradeAgreementBytes, err = stub.GetState(tradeKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(tradeAgreementBytes) == 0 {
		fmt.Println("No tradeAgreement request for " + args[0])
		return shim.Error("No agreement found")
	}

	//unjson tradeAgreement Bytes array to tradeAgreement object
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	//get shipmentlocation from network
	shipmentLocationKey, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentLocationBytes, err = stub.GetState(shipmentLocationKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipmentLocationBytes) == 0 {
		fmt.Println("Shipment for trade %s has not been prepared yet " + args[0])
		return shim.Error("Shipment not prepared yet.")
	}
	//get needed infor from network
	expBalanceBytes, err = stub.GetState(expBalKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	expBalance, err = strconv.Atoi(string(expBalanceBytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	impBalanceBytes, err = stub.GetState(impBalKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	impBalance, err = strconv.Atoi(string(impBalanceBytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	// Lấy thông tin về vận đơn (B/L) để kiểm tra hạn sử dụng
	bl_key, err = getBLKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	bl_in_bytes, err = stub.GetState(bl_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(bl_in_bytes, &bill_of_lading)
	if err != nil {
		return shim.Error("Error unmarshaling bill of lading structure: " + err.Error())
	}

	is_valid, err = checkExpDate(bill_of_lading.ExpDate)
	if err != nil {
		return shim.Error("ExpDate is not a valid Date type: " + err.Error())
	}
	if !is_valid {
		return shim.Error("B/L is out of date.")
	}

	//pay for pay amount base on shipment location
	var amountXprice = tradeAgreement.Amount * tradeAgreement.Price
	if string(shipmentLocationBytes) == SOURCE {
		paymentAmount = amountXprice / 2
		err = stub.PutState(paymentKey, []byte(HALFPAID))
	}
	if string(shipmentLocationBytes) == tradeAgreement.PlaceShipment {
		if tradeAgreement.Paid != 0 {
			paymentAmount = amountXprice - tradeAgreement.Paid
			err = stub.PutState(paymentKey, []byte(PAID))
			tradeAgreement.Status = PAID
		} else {
			paymentAmount = tradeAgreement.Amount * tradeAgreement.Price
			err = stub.PutState(paymentKey, []byte(PAID))
			tradeAgreement.Status = PAID
		}
	}
	tradeAgreement.Paid += paymentAmount
	expBalance += paymentAmount

	//check importer 's bank balance if available to pay
	if impBalance < paymentAmount {
		fmt.Println("Importer's bank balance " + strconv.Itoa(impBalance) + " is insufficient to cover payment amount " + strconv.Itoa(paymentAmount))
		return shim.Error("Importer 's bank cannot pay for agreement")
	}
	impBalance -= paymentAmount

	//put tradeAgreement, new expbalance, new impbalance to network
	tradeAgreementBytes, err = json.Marshal(tradeAgreement)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	err = stub.PutState(tradeKey, tradeAgreementBytes)
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	err = stub.PutState(expBalKey, []byte(strconv.Itoa(expBalance)))
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	err = stub.PutState(impBalKey, []byte(strconv.Itoa(impBalance)))
	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}

	if string(shipmentLocationBytes) != tradeAgreement.PlaceShipment{
		UpdateStep(stub, args[0], MAKE_HALF_PAYMENT)
	} else {
		UpdateStep(stub, args[0], MAKE_LAST_PAYMENT)
	}

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "MakePayment"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)

}

func (l *LogisticsChaincode) payForCollectShippingFee(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentlc_key, shipping_fee_key, bl_key, payer_key, trade_key string
	var paymentAmount, payerBalance, carBalance int
	var shipmentlc_in_bytes, shipping_fee_in_bytes, payer_balance_in_bytes, bl_in_bytes, trade_bytes []byte
	var bill_of_lading *BillofLading
	var trade_agreement *TradeAgreement
	var status string
	var err error

	if !(checkImporterbankOrg(creatorOrg, creatorCertIssuer) || checkExporterbankOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Importer or Exporter members can pay for shipping fee.")
	}

	if !checkAccounstancy(stub) {
		return shim.Error("Just accountant can do this")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	shipping_fee_key, err = getShippingFeeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipping_fee_in_bytes, err = stub.GetState(shipping_fee_key)

	if len(shipping_fee_in_bytes) == 0 {
		return shim.Error("No payment request for trade " + args[0] + " found.")
	}

	status = string(shipping_fee_in_bytes)

	// trường hợp phí vận chuyển đã thanh toán rồi
	if status == PAID {
		return shim.Error("Shipping fee is paid.")
	}

	bl_key, err = getBLKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	trade_key, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	

	bl_in_bytes, err = stub.GetState(bl_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(bl_in_bytes) == 0 {
		return shim.Error("No record for B/L found.")
	}

	err = json.Unmarshal(bl_in_bytes, &bill_of_lading)
	if err != nil {
		return shim.Error("Error unmarshalling bill of lading structure: " + err.Error())
	}

	if bill_of_lading.Status == PAID {
		shim.Error("BL had been paid")
	}

	// trường hợp trong hợp đồng ghi là đã thanh toán trước (PREPAID)
	if bill_of_lading.Note == PREPAID {
		return shim.Error("Shipping fee is already paid (prepaid).")
	}

	// trường hợp trong hợp đồng ghi là trả sau khi đến đích (TOCOLLECT) nhưng Carrier chưa request
	if status != REQUESTED {
		return shim.Error("Shipping fee was not requested by the Carrier")
	}

	shipmentlc_key, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentlc_in_bytes, err = stub.GetState(shipmentlc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_bytes, err = stub.GetState(trade_key)

	err = json.Unmarshal(trade_bytes, & trade_agreement)


	// err = json.Unmarshal(shipmentlc_in_bytes, &status)

	status = string(shipmentlc_in_bytes)

	// trường hợp trong hợp đồng là trả sau khi đến đích (TOCOLLECT) nhưng tàu chưa cập bến
	if status != trade_agreement.PlaceShipment {
		return shim.Error("The ship has not docked.")
	}

	// lấy thông tin người chịu trách nhiệm thanh toán phí vận chuyển từ vận đơn (B/L)
	switch bill_of_lading.Payer {
	case impKey:
		payer_key = impBalKey
	case expKey:
		payer_key = expBalKey
	default:
		return shim.Error("Invalid 'Payer' value in Bill of Lading, expecting '" + expKey + "' or '" + ibKey + "', found: " + bill_of_lading.Payer)
	}
	// phí vận chuyển
	paymentAmount = bill_of_lading.FeeOfShipment

	// lấy thông tin về tài khoản của người trả
	payer_balance_in_bytes, err = stub.GetState(payer_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	payerBalance, err = strconv.Atoi(string(payer_balance_in_bytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	// lấy thông tin về tài khoản của đơn vị vận chuyển
	carrier_balance_in_bytes, err := stub.GetState(carBalKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	carBalance, err = strconv.Atoi(string(carrier_balance_in_bytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	payerBalance -= paymentAmount
	carBalance += paymentAmount

	// cập nhật thông tin lên sổ cái
	err = stub.PutState(payer_key, []byte(strconv.Itoa(payerBalance)))
	if err != nil {
		return shim.Error("Error while recording payer balance: " + err.Error())
	}

	err = stub.PutState(carBalKey, []byte(strconv.Itoa(carBalance)))
	if err != nil {
		return shim.Error("Error while recording carrier balance: " + err.Error())
	}

	err = stub.PutState(shipping_fee_key, []byte(PAID))
	if err != nil {
		return shim.Error("Error while recording shipping key: " + err.Error())
	}

	UpdateStep(stub, args[0], PAY_FOR_COLLECT_SHIPPING_FEE)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "PayForCollectShippingFee"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)
}

func (l *LogisticsChaincode) updateShipmentLocation(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentlc_key, trade_key string
	var shipmentlc_in_bytes, trade_bytes []byte
	var err error
	var trade_agreement *TradeAgreement

	if !checkCarrierOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the Carrier members can update shipment location.")
	}

	if len(args) != 2 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 2: {TradeID, Location}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	shipmentlc_key, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentlc_in_bytes, err = stub.GetState(shipmentlc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	trade_key, err = getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	trade_bytes, err = stub.GetState(trade_key)

	err = json.Unmarshal(trade_bytes, & trade_agreement)

	if len(shipmentlc_in_bytes) == 0 {
		fmt.Printf("Shipment for trade %s has not been prepared yet.")
		return shim.Error("Shipment has not been prepared yet.")
	}

	if string(shipmentlc_in_bytes) == trade_agreement.PlaceShipment {
		shim.Error("shipment is at the finish of line")
	}

	if string(shipmentlc_in_bytes) == args[1] {
		fmt.Printf("Shipment for trade %s is already in location: %s", args[0], args[1])
	}

	err = stub.PutState(shipmentlc_key, []byte(args[1]))
	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], UPDATE_LOCATION)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "UpdateShipmentLocation"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	var shipStatus *ShipStatus

	shipLCKey, err := getShipLocationKey(stub, args[0])

	shipStatusBytes, err := stub.GetState(shipLCKey)

	err = json.Unmarshal(shipStatusBytes, &shipStatus)

	shipStatus.Status = args[1]

	shipStatusBytes, err = json.Marshal(shipStatus)

	err = stub.PutState(shipLCKey, shipStatusBytes)

	fmt.Printf("Shipment location for trade %s successfully reccorded.\n", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) getTradeStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var statuskey string
	var TradeStatusBytes []byte
	var err error

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	statuskey, err = getStatusKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	TradeStatusBytes, err = stub.GetState(statuskey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(TradeStatusBytes) == 0 {
		return shim.Error("No record found for: " + args[0])
	}

	return shim.Success(TradeStatusBytes)
}

func (l *LogisticsChaincode) getLCStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var lc_key, json_res string
	var letter_of_credit *LetterofCredit
	var lc_in_bytes []byte
	var err error

	if !(checkImporterOrg(creatorOrg, creatorCertIssuer) || checkExporterOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Importer or Exporter members can get L/C status.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	lc_key, err = getLCKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	lc_in_bytes, err = stub.GetState(lc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(lc_in_bytes) == 0 {
		return shim.Error("No record found for: " + args[0])
	}

	err = json.Unmarshal(lc_in_bytes, &letter_of_credit)
	if err != nil {
		return shim.Error("Error unmarshaling letter of credit structure: " + err.Error())
	}

	json_res = "{\"Status\":\"" + letter_of_credit.Status + "\"}"

	return shim.Success([]byte(json_res))
}

func (l *LogisticsChaincode) getELStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var el_key, json_res string
	var el_in_bytes []byte
	var export_license *ExportLicense
	var err error

	if !(checkExporterOrg(creatorOrg, creatorCertIssuer) || checkRegulatorOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Exporter or Regulator members can get E/L status.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	el_key, err = getELKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	el_in_bytes, err = stub.GetState(el_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(el_in_bytes) == 0 {
		return shim.Error("No record found for: " + args[0])
	}

	err = json.Unmarshal(el_in_bytes, &export_license)
	if err != nil {
		return shim.Error("Error unmarshaling export license structure: " + err.Error())
	}

	json_res = "{\"Status\":\"" + export_license.Status + "\"}"

	return shim.Success([]byte(json_res))
}

func (l *LogisticsChaincode) getBL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var bl_key string
	var bl_in_bytes []byte
	var err error

	if !(checkExporterOrg(creatorOrg, creatorCertIssuer) || checkImporterOrg(creatorOrg, creatorCertIssuer) || checkCarrierOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Importer, Exporter or Carrier members can get B/L.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	bl_key, err = getBLKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	bl_in_bytes, err = stub.GetState(bl_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(bl_in_bytes) == 0 {
		return shim.Error("No record found for: " + args[0])
	}

	return shim.Success(bl_in_bytes)
}

func (l *LogisticsChaincode) getShipmentLocation(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentlc_key, json_res string
	var shipmentlc_in_bytes []byte
	var err error

	if !(checkExporterOrg(creatorOrg, creatorCertIssuer) || checkImporterOrg(creatorOrg, creatorCertIssuer) || checkCarrierOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Importer, Exporter or Carrier members can get B/L.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	shipmentlc_key, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipmentlc_in_bytes, err = stub.GetState(shipmentlc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipmentlc_in_bytes) == 0 {
		return shim.Error("No record found for: " + args[0])
	}

	json_res = "{\"Location\":\"" + string(shipmentlc_in_bytes) + "\"}"

	return shim.Success([]byte(json_res))
}

func (l *LogisticsChaincode) getShippingFeeStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipping_fee_key, json_res string
	var shipping_fee_in_bytes []byte
	var err error

	if !(checkExporterOrg(creatorOrg, creatorCertIssuer) || checkImporterOrg(creatorOrg, creatorCertIssuer) || checkCarrierOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Importer, Exporter or Carrier members can get B/L.")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	shipping_fee_key, err = getShippingFeeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	shipping_fee_in_bytes, err = stub.GetState(shipping_fee_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(shipping_fee_in_bytes) == 0 {
		return shim.Error("No record found for: " + args[0])
	}

	json_res = "{\"Status\":\"" + string(shipping_fee_in_bytes) + "\"}"

	return shim.Success([]byte(json_res))
}

func (l *LogisticsChaincode) getAccountBalance(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var balanceKey, jsonResp string
	var balanceBytes []byte
	var err error

	//check number of input
	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments, expect 1, found " + strconv.Itoa(len(args)))
	// }

	// check caller orgs
	switch creatorOrg {
	case "ImporterOrgMSP":
		if !checkImporterOrg(creatorOrg, creatorCertIssuer) {
			return shim.Error("Access denied! Only the Importer or Importer Bank can get Importer Bank account balance")
		}
		balanceKey = impBalKey
	case "ImporterbankOrgMSP":
		if !checkImporterbankOrg(creatorOrg, creatorCertIssuer) {
			return shim.Error("Access denied! Only the Importer or Importer Bank can get Importer Bank account balance")
		}
		balanceKey = impBalKey
	case "ExporterOrgMSP":
		if !checkExporterOrg(creatorOrg, creatorCertIssuer) {
			return shim.Error("Access denied! Only the Exporter or Exporter Bank can get Exporter Bank account balance")
		}
		balanceKey = expBalKey
	case "ExporterbankOrgMSP":
		if !checkExporterbankOrg(creatorOrg, creatorCertIssuer) {
			return shim.Error("Access denied! Only the Exporter or Exporter Bank can get Exporter Bank account balance")
		}
		balanceKey = expBalKey
	case "CarrierOrgMSP":
		if !checkCarrierOrg(creatorOrg, creatorCertIssuer) {
			return shim.Error("Access denied! Only the Carrier can get Carrier's account balance")
		}
		balanceKey = carBalKey
	case "RegulatorOrgMSP":
		if !checkRegulatorOrg(creatorOrg, creatorCertIssuer) {
			return shim.Error("Access denied! Only the Regulator can get Regulator's account balance")
		}
		balanceKey = raBalKey
	default:
		return shim.Error("Access denied! Caller must be {Importer, Exporter, Carrier, Regulator}, found: " + creatorOrg)
	}

	//get balance amount from network & check it
	balanceBytes, err = stub.GetState(balanceKey)
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + balanceKey + "\"}"
		return shim.Error(jsonResp)
	}

	if len(balanceBytes) == 0 {
		jsonResp = "{\"Error\":\"No record found for " + balanceKey + "\"}"
		return shim.Error(jsonResp)
	}

	jsonResp = "{\"Balance\":" + string(balanceBytes) + "}"
	fmt.Printf("Query Response:%s\n", jsonResp)
	return shim.Success([]byte(jsonResp))
}

func (l *LogisticsChaincode) requestCustomsDeclaration(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Caller doesn't enough permission, just Exporter")
	}
	var CD *CustomsDeclaration
	var trade *TradeAgreement
	var el *ExportLicense

	if len(args) != 5 {
		return shim.Error("request 5 args, found " + string(len(args)))
	}

	if !checkManager(stub) {
		return shim.Error("Just manager can do this")
	}

	importer, err := stub.GetState(impKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	exporter, err := stub.GetState(expKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	carrier, err := stub.GetState(carKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	tradeKey, err := getTradeKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	tradebytes, err := stub.GetState(tradeKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(tradebytes, &trade)
	if err != nil {
		return shim.Error(err.Error())
	}

	elKey, err := getELKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	elBytes, err := stub.GetState(elKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(elBytes, &el)
	if err != nil {
		return shim.Error(err.Error())
	}

	if trade.Status != ACCEPTED {
		return shim.Error("tradeAgreement is not complete")
	}

	if el.Status != ISSUED {
		return shim.Error("Export License is not issued")
	}
	CDkey, err := getCDKey(stub, args[0])
	CDbytes, err := stub.GetState(CDkey)
	if len(CDbytes) != 0 {
		err = json.Unmarshal(CDbytes, &CD)
		if CD.Status == ACCEPTED {
			return shim.Error("CD is complice")
		}
		if CD.Status == PAYREQUEST {
			return shim.Error("CD is waiting for payment")
		}
		if CD.Status == REQUESTED {
			return shim.Error("CD is waiting for accept by regulator")
		}
		return shim.Error("unknown error")
	}

	CD = &CustomsDeclaration{args[0], args[1], string(exporter), string(importer), string(carrier), "", args[2], args[3], trade.DescriptionofGoods, args[4], trade.PlaceShipment, string(exporter), 0, REQUESTED}
	CDbytes, err = json.Marshal(CD)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(CDkey, CDbytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], REQUEST_CD)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "RequestCD"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)
}

func (l *LogisticsChaincode) acceptCustomsDeclaration(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	if checkRegulatorOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Only Regulator org can accept this paper")
	}

	if len(args) != 2 {
		return shim.Error("request 2 args, found " + string(len(args)))
	}
	CDkey, err := getCDKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	CDbytes, err := stub.GetState(CDkey)
	if len(CDbytes) == 0 {
		return shim.Error("this CD is not exists")
	}
	var CD *CustomsDeclaration
	err = json.Unmarshal(CDbytes, &CD)
	if CD.Status == ACCEPTED {
		return shim.Error(" this CD has been created & accepted from Regulator")
	}
	if CD.Status == PAYREQUEST {
		return shim.Error("this CD is waiting for pay")
	}
	regulatorBytes, err := stub.GetState(raKey)
	CD.Status = PAYREQUEST
	CD.Regulatory = string(regulatorBytes)
	fee, err := strconv.Atoi(args[1])
	CD.Fee = fee
	CDbytes, err = json.Marshal(CD)
	err = stub.PutState(CDkey, CDbytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], ACCEPT_CD)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "AcceptCD"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)
}

func (l *LogisticsChaincode) payForCustomsDeclaration(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	if checkExporterbankOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Only EXporterbank org can access this paper")
	}

	if !checkAccounstancy(stub) {
		return shim.Error("Just accountant can do this")
	}
	if len(args) != 1 {
		return shim.Error("Request 1 args, found" + string(len(args)))
	}
	CDkey, err := getCDKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	CDbytes, err := stub.GetState(CDkey)
	if len(CDbytes) == 0 {
		shim.Error("this CD is not exists")
	}

	var CD *CustomsDeclaration
	err = json.Unmarshal(CDbytes, &CD)
	if CD.Status == REQUESTED {
		return shim.Error("this CD need to be accepted by regulator first")
	}
	if CD.Status == ACCEPTED {
		return shim.Error("this CD has been created & accepted from Regulator")
	}
	var regBalance, expBalance int
	regBalancebytes, err := stub.GetState(raBalKey)
	err = json.Unmarshal(regBalancebytes, &regBalance)
	expBalanceBytes, err := stub.GetState(expBalKey)
	err = json.Unmarshal(expBalanceBytes, &expBalance)
	if expBalance < CD.Fee {
		return shim.Error("the payer account is not enough available")
	}
	expBalance -= CD.Fee
	regBalance += CD.Fee
	CD.Status = ACCEPTED
	CDbytes, err = json.Marshal(CD)
	expBalanceBytes, err = json.Marshal(expBalance)
	regBalancebytes, err = json.Marshal(regBalance)
	err = stub.PutState(CDkey, CDbytes)
	err = stub.PutState(expBalKey, expBalanceBytes)
	err = stub.PutState(raBalKey, regBalancebytes)

	if err != nil {
		return shim.Error(err.Error())
	}

	UpdateStep(stub, args[0], PAY_FOR_CD)

	var TradeStatus *TradeProcess

	statusKey, err := getStatusKey(stub, args[0])

	tradeStatusBytes, err := stub.GetState(statusKey)

	err = json.Unmarshal(tradeStatusBytes, &TradeStatus)

	TradeStatus.Status = "PayForCD"

	tradeStatusBytes, err = json.Marshal(TradeStatus)

	err = stub.PutState(statusKey, tradeStatusBytes)

	return shim.Success(nil)
}

func (l *LogisticsChaincode) getCDStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false && checkRegulatorOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("caller is not enough permission only Exporter & Regulator")
	}

	if len(args) != 1 {
		return shim.Error("expect 1 arg, found " + string(len(args)))
	}

	CDkeys, err := getCDKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	CDbytes, err := stub.GetState(CDkeys)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(CDbytes) == 0 {
		return shim.Error("this tradeAgreement is not exists")
	}

	var CD *CustomsDeclaration
	err = json.Unmarshal(CDbytes, &CD)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(CD.Status))
}

func (l *LogisticsChaincode) getPaymentStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false && checkImporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("caller is not enough permission only Exporter & Importer")
	}

	if len(args) != 1 {
		return shim.Error("expect 1 arg, found " + string(len(args)))
	}

	paymentKey, err := getPaymentKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	paymentBytes, err := stub.GetState(paymentKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	if len(paymentBytes) == 0 {
		return shim.Error("This Trade Agreement's payment is not created")
	}

	return shim.Success(paymentBytes)

}
func (l *LogisticsChaincode) getAllRecords(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var err error
	var list []string
	var C_key1, C_key2 string

	C_key2 = args[0]

	switch C_key2 {
		case "TA":
			C_key1 = "Trade"
		case "BL":
			C_key1 = "BillofLading"
		case "EL":
			C_key1 = "ExportLicense"
		case "LC":
			C_key1 = "LetterofCredit"
		case "CD":
			C_key1 = "CustomsDeclaration"
		case "P":
			C_key1 = "Payment"
		case "TS":
			C_key1 = "tradeProcess"
		case "SL":
			C_key1 = "shipStatus"
		default:
			return shim.Error("Invalid argument '" + C_key2 + "'.")
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(C_key1, []string{C_key2})
	if err != nil {
		return shim.Error(err.Error())
	}

	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords

	for resultsIterator.HasNext() {
		//queryKeyAsStr, queryValAsBytes, err := resultsIterator.Next()
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		// Add a comma before array members, suppress it for the first array member
		list = append(list, string(queryResponse.Value))
	}

	listbytes, err := json.Marshal(list)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(listbytes)
}
func main() {
	lc := new(LogisticsChaincode)
	// twc.testMode = false
	err := shim.Start(lc)
	if err != nil {
		fmt.Printf("Error starting Trade Workflow chaincode: %s", err)
	}
}