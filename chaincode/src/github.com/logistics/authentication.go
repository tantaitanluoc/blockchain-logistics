package main

import (
	"crypto/x509"
	"fmt"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
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

func getUserRole(stub shim.ChaincodeStubInterface, role string) (string, bool) {
	var values string
	var found bool
	var err error
	sinfo, err := cid.New(stub)
	values, found, err = sinfo.GetAttributeValue(role)
	if found == false {
		return "", false
	}

	if err != nil {
		return "", false
	}

	return values, true
}

func checkAccounstancy(stub shim.ChaincodeStubInterface) bool {
	var value string
	var err bool
	value, err = getUserRole(stub, "role")

	if err == false {
		return false
	}

	if value != "accountancy" {
		return false
	}

	return true
}

func checkManager(stub shim.ChaincodeStubInterface) bool {
	var value string
	var err bool
	value, err = getUserRole(stub, "role")

	if err == false {
		return err
	}

	if value != "manager" {
		return false
	}
	return true
}

func checkImporterOrg(mspID string, cert string) bool {
	if (mspID == "ImporterOrgMSP") && (cert == "ca.importerorg.logistics.com") {
		return true
	}
	return false
}

func checkExporterOrg(mspID string, cert string) bool {
	if (mspID == "ExporterOrgMSP") && (cert == "ca.exporterorg.logistics.com") {
		return true
	}
	return false
}

func checkCarrierOrg(mspID string, cert string) bool {
	if (mspID == "CarrierOrgMSP") && (cert == "ca.carrierorg.logistics.com") {
		return true
	}
	return false
}

func checkRegulatorOrg(mspID string, cert string) bool {
	if (mspID == "RegulatorOrgMSP") && (cert == "ca.regulatororg.logistics.com") {
		return true
	}
	return false
}

func checkExporterbankOrg(mspID string, cert string) bool {
	if (mspID == "ExporterbankOrgMSP") && (cert == "ca.exporterbankorg.logistics.com") {
		return true
	}
	return false
}

func checkImporterbankOrg(mspID string, cert string) bool {
	if (mspID == "ImporterbankOrgMSP") && (cert == "ca.importerbankorg.logistics.com") {
		return true
	}
	return false
}

func checkExpDate(ExpDate string) (bool, error) {
	var err error
	var layout = "01-02-2006" // mm/dd/yyyy
	var expdate, today time.Time

	expdate, err = time.Parse(layout, ExpDate)
	if err != nil {
		return false, err
	}
	today, err = time.Parse(layout, time.Now().Format(layout))
	if err != nil {
		return false, err
	}

	return expdate.After(today) || today.Equal(expdate), nil
}
