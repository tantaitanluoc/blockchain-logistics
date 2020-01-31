package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func getTradeKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	trade_key, err := stub.CreateCompositeKey("Trade", []string{"TA", tradeID})

	if err != nil {
		return "", err
	}
	return trade_key, nil
}
func getLCKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	lc_key, err := stub.CreateCompositeKey("LetterofCredit", []string{"LC", tradeID})

	if err != nil {
		return "", err
	}
	return lc_key, nil

}
func getELKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	el_key, err := stub.CreateCompositeKey("ExportLicense", []string{"EL", tradeID})

	if err != nil {
		return "", err
	}
	return el_key, nil

}
func getBLKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	bl_key, err := stub.CreateCompositeKey("BillofLading", []string{"BL", tradeID})

	if err != nil {
		return "", err
	}
	return bl_key, nil

}
func getShippingFeeKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	shipment_key, err := stub.CreateCompositeKey("Shipment", []string{tradeID})

	if err != nil {
		return "", err
	}
	return shipment_key, nil
}
func getShipmentLocationKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	shipmentlc_key, err := stub.CreateCompositeKey("Shipment_status", []string{"shipment", tradeID})

	if err != nil {
		return "", err
	}
	return shipmentlc_key, nil

}
func getPaymentKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	payment_key, err := stub.CreateCompositeKey("Payment", []string{"P", tradeID})

	if err != nil {
		return "", err
	}
	return payment_key, nil

}
func getCDKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	CD_key, err := stub.CreateCompositeKey("CustomsDeclaration", []string{"CD", tradeID})

	if err != nil {
		return "", err
	}
	return CD_key, nil

}

func getStatusKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	statusKey, err := stub.CreateCompositeKey("tradeProcess", []string{"TS", tradeID})
	if err != nil {
		return "", err
	}
	return statusKey, nil
}

func getShipLocationKey(stub shim.ChaincodeStubInterface, tradeID string) (string, error) {
	shiplc_key, err := stub.CreateCompositeKey("shipStatus", []string{"SL", tradeID})

	if err != nil {
		return "", err
	}
	return shiplc_key, nil

}
