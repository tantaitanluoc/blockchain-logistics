package main

import
(
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func getTradeKey(stub shim.ChaincodeInterface, tradeID string) (string,error){
	trade_key, err := stub.CreateCompositeKey("Trade", []string{tradeID})

	if err != nil{
		return "",err
	}
	return trade_key,nil
}
func getLCKey(stub shim.ChaincodeInterface, tradeID string) (string,error){	
	lc_key, err := stub.CreateCompositeKey("LetterofCredit", []string{tradeID})

	if err != nil{
		return "",err
	}
	return lc_key,nil
	
}
func getELKey(stub shim.ChaincodeInterface, tradeID string) (string,error){
	el_key, err := stub.CreateCompositeKey("ExportLicense", []string{tradeID})

	if err != nil{
		return "",err
	}
	return el_key,nil
	
}
func getBLKey(stub shim.ChaincodeInterface, tradeID string) (string,error){
	bl_key, err := stub.CreateCompositeKey("BillofLading", []string{tradeID})

	if err != nil{
		return "",err
	}
	return bl_key,nil
	
}
func getShipmentLocationKey(stub shim.ChaincodeInterface, tradeID string) (string,error){
	shipmentlc_key, err := stub.CreateCompositeKey("Shipment", []string{tradeID})

	if err != nil{
		return "",err
	}
	return shipmentlc_key,nil
	
}
func getPaymentKey(stub shim.ChaincodeInterface, tradeID string) (string,error){
	payment_key, err := stub.CreateCompositeKey("Payment", []string{tradeID})

	if err != nil{
		return "",err
	}
	return payment_key,nil
	
}