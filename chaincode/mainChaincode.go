package main


import
(
	"fmt"
	"errors"
	"strconv"
	"strings"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type LogisticsChaincode struct{
}

func(l *LogisticsChaincode) Init(stub shim.ChaincodeStubInterface) sc.Response{

}
func(l *LogisticsChaincode) Invoke(stub shim.ChaincodeStubInterface) sc.Response{
	var creatorOrg, creatorCertIssuer string
	var err error

	creatorOrg,creatorCertIssuer,err = getCreatorInfo(stub)

	if err != nil{
		fmt.Errorf("Error extracting creator identity info: %s\n", err.Error())
		return shim.Error(err.Error())
	}
	fmt.Printf("LogisticsChaincode invoked by '%s', '%s'\n", creatorOrg, creatorCertIssuer)

	fcn, args := stub.GetFunctionAndParameters()

	switch(fcn){
		case "requestTrade":
			return l.requestTrade(stub,creatorOrg,creatorCertIssuer,args)
		case "acceptTrade":
			return l.acceptTrade(stub,creatorOrg,creatorCertIssuer,args)
		case "requestLC":
			return l.requestLC(stub,creatorOrg,creatorCertIssuer,args)
		case "issueLC":
			return l.issueLC(stub,creatorOrg,creatorCertIssuer,args)
		case "acceptLC":
			return l.acceptLC(stub,creatorOrg,creatorCertIssuer,args)
		case "requestEL":
			return l.requestEL(stub,creatorOrg,creatorCertIssuer,args)
		case "issueLC":
			return l.issueLC(stub,creatorOrg,creatorCertIssuer,args)
		case "acceptEL":
			return l.acceptEL(stub,creatorOrg,creatorCertIssuer,args)
		case "prepareShipment":
			return l.prepareShipment(stub,creatorOrg,creatorCertIssuer,args)
		case "acceptShipmentAndIssueBL":
			return l.acceptShipmentAndIssueBL(stub,creatorOrg,creatorCertIssuer,args)
		case "requestPayment":
			return l.requestPayment(stub,creatorOrg,creatorCertIssuer,args)
		case "makePayment":
			return l.makePayment(stub,creatorOrg,creatorCertIssuer,args)
		case "updateShipmentLocation":
			return l.updateShipmentLocation(stub,creatorOrg,creatorCertIssuer,args)
		case "getTradeStatus":
			return l.getTradeStatus(stub,creatorOrg,creatorCertIssuer,args)
		case "getLCStatus":
			return l.getLCStatus(stub,creatorOrg,creatorCertIssuer,args)
		case "getELStatus":
			return l.getELStatus(stub,creatorOrg,creatorCertIssuer,args)
		case "getBL":
			return l.getBL(stub,creatorOrg,creatorCertIssuer,args)
		case "getShipmentLocation":
			return l.getShipmentLocation(stub,creatorOrg,creatorCertIssuer,args)
		case "getAccountBalance":
			return l.getAccountBalance(stub,creatorOrg,creatorCertIssuer,args)
		default:
			return shim.Error("Invalid function name");
	}


} 

func(l *LogisticsChaincode) requestTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{
	var trade_key string
	var trade_agreement *TradeAgreement
	var trade_agreement_in_bytes []byte
	var amount int
	var err error


	if !checkImporterOrg(creatorOrg,creatorCertIssuer){
		return shim.Error("Access denied! Only the importer can make a trade request")
	}

	if len(args)!= 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 3: {ID, Amount, Description of Goods}. Found %d", len(args)))
		return shim.Error(err.Error())
	}

	amount, err = strconv.Atoi(string(args[1])) // convert string sang int

	if err != nil {
		return shim.Error(err.Error())
	}

	trade_agreement = &TradeAgreement{amount,args[2],0,REQUESTED} // tạo trade agreement với trạng thái là đã yêu cầu (requested)

	trade_agreement_in_bytes, err = json.Marshal(trade_agreement) // mã hóa thành kiểu JSON

	if err != nil {
		return shim.Error("Error marshaling trade agreement structure")
	}
	
	trade_key, err = getTradeKey(stub,args[0]) // generate trade key 

	if err != nil {
		return shim.Error("Error while generating composite key "+err.Error())
	}

	err = stub.PutState(trade_key,trade_agreement) // ghi vào sổ cái

	if err != nil {
		return shim.Error("Error while recording data into ledger. "+err.Error())
	}

	fmt.Printf("Trade %s recorded.",args[0])
	return shim.Success(nil)
}

func(l *LogisticsChaincode) acceptTrade(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) requestLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{
	var trade_key, lc_key string 
	var trade_agreement_in_bytes, lc_in_bytes, exporter_in_bytes []byte
	var trade_agreement *TradeAgreement
	var letter_of_credit *LetterofCredit
	var err error

	if !checkImporterOrg(creatorOrg,creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer can request for L/C")
	}

	if len(args) != 1{
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting 1: {TradeID}. Found %d", len(args)))
		return shim.Error(err.Error())		
	}

	trade_key, err = getTradeKey(stub,args[0])

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

	err = json.Unmarshal(trade_agreement_in_bytes,&trade_agreement) // json decode và lưu vào biến trade_agreement

	if err != nil {
		return shim.Error(err.Error())
	}

	if trade_agreement.Status != ACCEPTED{
		return shim.Error("Trade has not been acccepted by the parties")
	}

	exporter_in_bytes, err = stub.GetState(expkey) // lấy thông tin bên thụ hưởng
	if err != nil {
		return shim.Error(err.Error())
	}

	letter_of_credit = &LetterofCredit{"","",string(exporter_in_bytes),trade_agreement.Amount,[]string{},REQUESTED}

	lc_in_bytes, err = json.Marshal(letter_of_credit)
	if err != nil {
		return shim.Error("Error marshaling letter of credit structure")
	}

	lc_key, err = getLCKey(stub,args[0]) // generate key cho L/C
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(lc_key,lc_in_bytes) // ghi lên sổ cái
	if err != nil {
		return shim.Error("Error while recording data into ledger. "+err.Error())
	}

	fmt.Printf("L/C request for trade %s recorded.",args[0])
	return shim.Success(nil)

}

func(l *LogisticsChaincode) issueLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{
	var lc_key string 
	var lc_in_bytes [] byte
	var letter_of_credit *LetterofCredit
	var err error

	if !checkImporterOrg(creatorOrg,creatorCertIssuer) {
		return shim.Error("Access denied! Only the importer members can issue L/C")
	}

	if len(args) < 3 {
		err = errors.New(fmt.Sprintf("Incorrect number of arguments. Expecting at least 3: {TradeID, L/C ID, ExpDate}. Found %d", len(args)))
		return shim.Error(err.Error())			
	}

	lc_key, err = getLCKey(stub,args[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	lc_in_bytes, err = stub.GetState(lc_key)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = json.Unmarshal(lc_in_bytes,&letter_of_credit)
	if err != nil {
		return shim.Error(err.Error())
	}

	if letter_of_credit.Status == ISSUED{
		fmt.Printf("L/C for trade %s is already issued",args[0])
	} else if letter_of_credit.Status == ACCEPTED{
		fmt.Printf("L/C for trade %s is already accepted",args[0])
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
	fmt.Printf("L/C issuance %s has been recorded.",args[0])
	return shim.Success(nil)
}

func(l *LogisticsChaincode) acceptLC(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) requestEL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{
	var trade_key, lc_key, el_key string
	var export_license *ExportLicense
	var trade_agreement *TradeAgreement
	var letter_of_credit *LetterofCredit
	var trade_agreement_in_bytes, lc_in_bytes, el_in_bytes, exporter_in_bytes, carrier_in_bytes, approver_in_bytes []byte
	var err error

	if !checkExporterOrg(creatorOrg,creatorCertIssuer){
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

	if letter_of_credit.Status != ACCEPTED{
		fmt.Printf("L/C for trade %s has not been acccepted yet", args[0])
		return shim.Error("L/C has not been accepted")
	}	

	trade_key, err = getTradeKey(stub,args[0])
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

	export_license = &ExportLicense{"","",string(exporter_in_bytes),string(carrier_in_bytes),trade_agreement.DescriptionofGoods, string(approver_in_bytes),REQUESTED}
	el_in_bytes, err = json.Marshal(export_license)
	if err != nil {
		return shim.Error("Error marshaling exporter license structure: "+err.Error())
	}

	el_key, err = getELKey(stub,args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(el_key,el_in_bytes)
	if err != nil {
		return shim.Error("Error while recording data into ledger: "+err.Error())
	}

	fmt.Printf("Export License request for trade %s successfully recorded.",args[0])
	return shim.Success(nil)
}

func(l *LogisticsChaincode) issueEL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) acceptEL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) prepareShipment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) acceptShipmentAndIssueBL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) requestPayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) makePayment(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) updateShipmentLocation(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) getTradeStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) getLCStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) getELStatus(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) getBL(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) getShipmentLocation(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func(l *LogisticsChaincode) getAccountBalance(stub shim.ChaincodeStubInterface, creatorOrg string, creatorCertIssuer string, args []string) sc.Response{

}

func main(){

}