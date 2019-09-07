package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type LogisticsChaincode struct {
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
	if lenArgs != 8 {
		err := errors.New(fmt.Sprintf("Incorrect number of arguments. Expect 8\n" +
			"{\n" +
			"	Exporter, \n" +
			"	Exporter's Bank, \n" +
			"	Exporter's Account Balance, \n" +
			"	Importer, \n" +
			"	Importer's Bank, \n" +
			"	Importer's Account Balance, \n" +
			"	Carrier, \n" +
			"	Regulatory Authority\n" +
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
		"	Regulatory Authority: " + args[7] + ",\n" +
		"}\n")

	// Map participant identities to their roles on the ledger
	roleKeys := []string{expKey, ebKey, expBalKey, impKey, ibKey, impBalKey, carKey, raKey}
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
	case "acceptTrade":
		return l.acceptTrade(stub, creatorOrg, creatorCertIssuer, args)
	case "requestLC":
		return l.requestLC(stub, creatorOrg, creatorCertIssuer, args)
	case "issueLC":
		return l.issueLC(stub, creatorOrg, creatorCertIssuer, args)
	case "acceptLC":
		return l.acceptLC(stub, creatorOrg, creatorCertIssuer, args)
	case "requestEL":
		return l.requestEL(stub, creatorOrg, creatorCertIssuer, args)
	case "issueEL":
		return l.issueLC(stub, creatorOrg, creatorCertIssuer, args)
	case "prepareShipment":
		return l.prepareShipment(stub, creatorOrg, creatorCertIssuer, args)
	case "acceptShipmentAndIssueBL":
		return l.acceptShipmentAndIssueBL(stub, creatorOrg, creatorCertIssuer, args)
	case "requestPayment":
		return l.requestPayment(stub, creatorOrg, creatorCertIssuer, args)
	case "makePayment":
		return l.makePayment(stub, creatorOrg, creatorCertIssuer, args)
	case "updateShipmentLocation":
		return l.updateShipmentLocation(stub, creatorOrg, creatorCertIssuer, args)
	case "getTradeStatus":
		return l.getTradeStatus(stub, creatorOrg, creatorCertIssuer, args)
	case "getLCStatus":
		return l.getLCStatus(stub, creatorOrg, creatorCertIssuer, args)
	case "getELStatus":
		return l.getELStatus(stub, creatorOrg, creatorCertIssuer, args)
	case "getBL":
		return l.getBL(stub, creatorOrg, creatorCertIssuer, args)
	case "getShipmentLocation":
		return l.getShipmentLocation(stub, creatorOrg, creatorCertIssuer, args)
	case "getAccountBalance":
		return l.getAccountBalance(stub, creatorOrg, creatorCertIssuer, args)
	default:
		return shim.Error("Invalid function name")
	}

}

func (l *LogisticsChaincode) requestTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key string
	var trade_agreement *TradeAgreement
	var trade_agreement_in_bytes []byte
	var amount int
	var err error

	if !checkImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer can make a trade request")
	}

	if len(args) != 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 3: {ID, Amount, Description of Goods}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	amount, err = strconv.Atoi(string(args[1])) // convert string sang int

	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement = &TradeAgreement{amount, args[2], 0, REQUESTED} // tạo trade agreement với trạng thái là đã yêu cầu (requested)

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

	//checking count of agrs input
	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Only one trade Key Found %d \n", len(args)))
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
		err = errors.New(fmt.Sprintf("No reccord found for %s", args[0]))
		return shim.Error(err.Error())
	}

	//tranform agreement byte array to tradeAgreement type
	err = json.Unmarshal(tradeAgreementBytes, &tradeAgreement)
	if err != nil {
		return shim.Error(err.Error())
	}

	// create accception
	if tradeAgreement.Status == ACCEPTED {
		fmt.Println(args[0] + " already accepted")
	} else {
		tradeAgreement.Status = ACCEPTED
		tradeAgreementBytes, err = json.Marshal(tradeAgreement)
		if err != nil {
			return shim.Error("Error marshaling trade agreement structure")
		}
		err = stub.PutState(tradeKey, tradeAgreementBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Println("Accepting " + args[0])
	return shim.Success(nil)

}

func (l *LogisticsChaincode) requestLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key, lc_key string
	var trade_agreement_in_bytes, lc_in_bytes, exporter_in_bytes []byte
	var trade_agreement *TradeAgreement
	var letter_of_credit *LetterofCredit
	var err error

	if !checkImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer can request for L/C")
	}

	if len(args) != 1 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
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

	exporter_in_bytes, err = stub.GetState(expKey) // lấy thông tin bên thụ hưởng
	if err != nil {
		return shim.Error(err.Error())
	}

	letter_of_credit = &LetterofCredit{"", "", string(exporter_in_bytes), trade_agreement.Amount, []string{}, REQUESTED}

	lc_in_bytes, err = json.Marshal(letter_of_credit)
	if err != nil {
		return shim.Error("Error marshaling letter of credit structure")
	}

	lc_key, err = getLCKey(stub, args[0]) // generate key cho L/C
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(lc_key, lc_in_bytes) // ghi lên sổ cái
	if err != nil {
		return shim.Error("Error while recording data into ledger. " + err.Error())
	}

	fmt.Printf("L/C request for trade %s recorded.", args[0])
	return shim.Success(nil)

}

func (l *LogisticsChaincode) issueLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var lc_key string
	var lc_in_bytes []byte
	var letter_of_credit *LetterofCredit
	var err error

	if !checkImporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer members can issue L/C")
	}

	if len(args) < 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting at least 3: {TradeID, L/C ID, ExpDate}. Found %d", len(args)))
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

	if letter_of_credit.Status == ISSUED {
		fmt.Printf("L/C for trade %s is already issued", args[0])
	} else if letter_of_credit.Status == ACCEPTED {
		fmt.Printf("L/C for trade %s is already accepted", args[0])
	} else {
		letter_of_credit.ID = args[1]
		letter_of_credit.ExpDate = args[2]
		letter_of_credit.Documents = args[3:] // mảng Documents lấy từ tham số thứ 4 trở đi
		letter_of_credit.Status = ISSUED

		lc_in_bytes, err = json.Marshal(letter_of_credit)
		if err != nil {
			return shim.Error("Error marshaling L/C structure")
		}

		err = stub.PutState(lc_key, lc_in_bytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("L/C issuance %s has been recorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) acceptLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var lcKey string
	var letterOfCreditBytes []byte
	var letterOfCredit *LetterofCredit
	var err error
	//check permission of caller
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Caller doesn't enough permission to accept LC")
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
	fmt.Println("Accepting " + args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) requestEL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key, lc_key, el_key string
	var export_license *ExportLicense
	var trade_agreement *TradeAgreement
	var letter_of_credit *LetterofCredit
	var trade_agreement_in_bytes, lc_in_bytes, el_in_bytes, exporter_in_bytes, carrier_in_bytes, approver_in_bytes []byte
	var err error

	if !checkExporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the exporter members can make a request for E/L")
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

	err = json.Unmarshal(lc_in_bytes, &letter_of_credit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letter_of_credit.Status != ACCEPTED {
		fmt.Printf("L/C for trade %s has not been acccepted yet", args[0])
		return shim.Error("L/C has not been accepted")
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

	export_license = &ExportLicense{"", "", string(exporter_in_bytes), string(carrier_in_bytes), trade_agreement.DescriptionofGoods, string(approver_in_bytes), REQUESTED}
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

	if len(args) != 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 3: {TradeID, L/C ID, ExpDate}. Found %d", len(args)))
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
		export_license.ID = args[1]
		export_license.ExpDate = args[2]
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

	fmt.Printf("Export License issuance for trade %s successfully reccorded.", args[0])
	return shim.Success(nil)
}
func (l *LogisticsChaincode) prepareShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var elKey, shipmentLocationKey string
	var shipmentLocationBytes, exportLicenseBytes []byte
	var exportLicense *ExportLicense
	var err error

	//check permission of caller
	if checkExporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("Caller doesn't enough permission to prepare shipment")
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

	shipmentLocationKey, err = getShipmentLocationKey(stub, args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(shipmentLocationKey, []byte(SOURCE))
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("Shipment preparation for trade %s recorded\n", args[0])

	return shim.Success(nil)
}

func (l *LogisticsChaincode) acceptShipmentAndIssueBL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentLocationKey, blKey, tradeKey string
	var shipmentLocationBytes, tradeAgreementBytes, billOfLadingBytes, exporterBytes, carrierBytes, beneficiaryBytes []byte
	var billOfLading *BillofLading
	var tradeAgreement *TradeAgreement
	var err error

	//check permission of caller
	if checkCarrierOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error(err.Error())
	}
	//check number of iput argument
	if len(args) != 5 {
		err = errors.New(fmt.Sprintln("Incorrect number of arguments, expect 5, found " + strconv.Itoa(len(args))))
		return shim.Error(err.Error())
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
		fmt.Println("shipment for " + args[0] + " has not completed to prepare")
		return shim.Error("shipment not prepare")
	}
	if string(shipmentLocationBytes) == SOURCE {
		fmt.Println("shipment for " + args[0] + " has been prepared")
		return shim.Error("shipment has been prepared")
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
	carrierBytes, err = stub.GetState(carKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	beneficiaryBytes, err = stub.GetState(ibKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	// create bill of lading object
	billOfLading = &BillofLading{args[1], args[2], string(exporterBytes), string(carrierBytes), tradeAgreement.DescriptionofGoods,
		tradeAgreement.Amount, string(beneficiaryBytes), args[3], args[4]}
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

	fmt.Println("B/L for trade " + args[0] + " is recorded")
	return shim.Success(nil)

}

func (l *LogisticsChaincode) requestPayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentlc_key, payment_key, trade_key string
	var shipmentlc_in_bytes, payment_in_bytes, trade_agreement_in_bytes []byte
	var trade_agreement *TradeAgreement
	var err error

	if !checkExporterOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the exporter members can make payment request.")
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

	if len(payment_in_bytes) == 0 {
		fmt.Printf("Payment request already pending for trade %s", args[0])
	} else {
		fmt.Printf("Amount paid for trade %s: %d ; total required: %d\n", args[0], trade_agreement.Payment, trade_agreement.Amount)
		if trade_agreement.Payment == trade_agreement.Amount { // Hóa đơn đã hoàn tất việc thanh toán
			fmt.Printf("Payment already settled for trade %s\n", args[0])
			return shim.Error("Payment already settled")
		}

		if string(shipmentlc_in_bytes) == SOURCE && trade_agreement.Amount != 0 { // Hóa đơn đã thanh toán một phần
			fmt.Printf("Partial payment already made for trade %s\n", args[0])
			return shim.Error("Partial payment already made")
		}

		err = stub.PutState(payment_key, []byte(REQUESTED))
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	fmt.Printf("Payment request for trade %s successfully recorded.", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) makePayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentLocationKey, paymentKey, tradeKey string
	var paymentAmount, expBalance, impBalance int
	var shipmentLocationBytes, paymentBytes, tradeAgreementBytes, impBalanceBytes, expBalanceBytes []byte
	var tradeAgreement *TradeAgreement
	var err error

	//check permission of caller
	if checkImporterOrg(creatorOrg, creatorCertIssuer) == false {
		return shim.Error("caller doesn't enough permission to exercuse")
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
		return shim.Error("Shipment not prepared yet")
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

	//pay for pay amount base on shipment location
	if string(shipmentLocationBytes) == SOURCE {
		paymentAmount = tradeAgreement.Amount / 2
	} else {
		paymentAmount = tradeAgreement.Amount - tradeAgreement.Payment
	}
	tradeAgreement.Payment += paymentAmount
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

	// delete current payment key from network
	err = stub.DelState(paymentKey)
	if err != nil {
		fmt.Println(err.Error())
		return shim.Error("Failed to delete payment request from ledger")
	}

	return shim.Success(nil)

}
func (l *LogisticsChaincode) updateShipmentLocation(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var shipmentlc_key string
	var shipmentlc_in_bytes []byte
	var err error

	if !checkRegulatorOrg(creatorOrg, creatorCertIssuer) {
		return shim.Error("Access denied! Only the Regulator members can update shipment location.")
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

	if len(shipmentlc_in_bytes) == 0 {
		fmt.Printf("Shipment for trade %s has not been prepared yet.")
		return shim.Error("Shipment has not been prepared yet.")
	}

	if string(shipmentlc_in_bytes) == args[1] {
		fmt.Printf("Shipment for trade %s is already in location: %s", args[0], args[1])
	}

	err = stub.PutState(shipmentlc_key, []byte(args[1]))
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Printf("Shipment location for trade %s successfully reccorded.\n", args[0])
	return shim.Success(nil)
}

func (l *LogisticsChaincode) getTradeStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var trade_key, json_res string
	var trade_agreement *TradeAgreement
	var trade_agreement_in_bytes []byte
	var err error

	if !(checkImporterOrg(creatorOrg, creatorCertIssuer) || checkExporterOrg(creatorOrg, creatorCertIssuer)) {
		return shim.Error("Access denied! Only the Importer or Exporter members can get trade status.")
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
		return shim.Error("No record found for: " + args[0])
	}

	err = json.Unmarshal(trade_agreement_in_bytes, &trade_agreement)
	if err != nil {
		return shim.Error("Error unmarshaling trade agreement structure: " + err.Error())
	}

	json_res = "{\"Status\":\"" + trade_agreement.Status + "\"}"

	return shim.Success([]byte(json_res))
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

func (l *LogisticsChaincode) getAccountBalance(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response {
	var entity, balanceKey, jsonResp string
	var balanceBytes []byte
	var err error

	//check number of input
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments, expect 2, found " + strconv.Itoa(len(args)))
	}

	// check caller orgs
	entity = strings.ToLower(args[1])
	if entity == "entity" {
		if checkExporterOrg(creatorOrg, creatorCertIssuer) == false {
			return shim.Error("caller doesn't enough permission")
		}
		balanceKey = expBalKey
	} else if entity == "importer" {
		if checkImporterOrg(creatorOrg, creatorCertIssuer) == false {
			return shim.Error("caller doesn't enough permission")
		}
		balanceKey = impBalKey
	} else {
		err = errors.New(fmt.Sprintln("Invalid entity" + args[1] + "Permissible values: {exporter, importer} "))
		return shim.Error(err.Error())
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

	jsonResp = "{'Balance':" + string(balanceBytes) + "\n}"
	fmt.Printf("Query Response:%s\n", jsonResp)
	return shim.Success([]byte(jsonResp))
}

func main() {
	lc := new(LogisticsChaincode)
	// twc.testMode = false
	err := shim.Start(lc)
	if err != nil {
		fmt.Printf("Error starting Trade Workflow chaincode: %s", err)
	}
}
