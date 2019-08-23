package main


import
(
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"crypto/x509"
)

func getTxCreatorInfo(stub shim.ChaincodeStubInterface) (string, string, error) {
	var mspid string
	var err error
	var cert *x509.Certificate

	mspid, err = cid.GetMSPID(stub)
	if err != nil {
		fmt.Printf("Error getting MSP identity: %s\n", err.Error())
		return "", "", err
	}

	cert, err = cid.GetX509Certificate(stub)
	if err != nil {
		fmt.Printf("Error getting client certificate: %s\n", err.Error())
		return "", "", err
	}

	return mspid, cert.Issuer.CommonName, nil
}

func authenticateImporterOrg(mspID string, certCN string) bool{
	return (mspID == "ImporterOrgMSP") && (certCN == "ca.importerorg.logistics.com")
}
func authenticateExporterOrg(mspID string, certCN string) bool{
	return (mspID == "ExporterOrgMSP") && (certCN == "ca.exporterorg.logistics.com")
}
func authenticateCarrierOrg(mspID string, certCN string) bool{
	return (mspID == "CarrierOrgMSP") && (certCN == "ca.carrierorg.logistics.com")
}
func authenticateRegulatorOrg(mspID string, certCN string) bool{
	return (mspID == "RegulatorOrgMSP") && (certCN == "ca.regulatororg.logistics.com")
}