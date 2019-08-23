package main

import (
	"crypto/x509"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
)

func getCreatorInfo(stub shim.ChaincodeStubInterface) (string, string, error) {
	var mspID string
	var cert *x509.Certificate
	var err error

	mspID, err = cid.GetMSPID(stub)

	if err != nil {
		fmt.Printf("Error unmarshalling creator identity: %s\n", err.Error())
		return "", "", err
	}

	cert, err = cid.GetX509Certificate(stub)

	if err != nil {
		fmt.Printf("Error unmarshalling creator identity: %s\n", err.Error())
		return "", "", err
	}

	return mspID, cert.Issuer.CommonName, nil
} // get Id and Certificate of the MSP associated with the identity that submitted the transaction

func checkImporterOrg(mspID string, cert string) bool {
	if (mspID == "ImporterOrgMSP") && (cert == "ca.importer.logistics.com") {
		return true
	}
	return false
}

func checkExporterOrg(mspID string, cert string) bool {
	if (mspID == "ExporterOrgMSP") && (cert == "ca.exporter.logistics.com") {
		return true
	}
	return false
}

func checkCarrierOrg(mspID string, cert string) bool {
	if (mspID == "CarrierOrgMSP") && (cert == "ca.carrier.logistics.com") {
		return true
	}
	return false
}

func checkRegulatorOrg(mspID string, cert string) bool {
	if (mspID == "RegulatorOrgMSP") && (cert == "ca.regulator.logistics.com") {
		return true
	}
	return false
}

//authenticate org of user
