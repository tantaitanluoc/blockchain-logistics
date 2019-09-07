package main

type LetterofCredit struct {
	ID          string   `json:"id"`
	ExpDate     string   `json:"expDate"`
	Beneficiary string   `json:"beneficiary"` // Ben thu huong
	Amount      int      `json:"amount"`
	Documents   []string `json:"documents"`
	Status      string   `json:"status"`
}

type ExportLicense struct {
	ID                 string `json:"id"`
	ExpDate            string `json:"expDate"`
	Exporter           string `json:"exporter"`
	Carrier            string `json:"carrier"`
	DescriptionofGoods string `json:"descriptionofGoods"`
	Approver           string `json:"approver"`
	Status             string `json:"status"`
}

type BillofLading struct {
	ID                 string `json:"id"`
	ExpDate            string `json:"expDate"`
	Exporter           string `json:"exporter"`
	Carrier            string `json:"carrier"`
	DescriptionofGoods string `json:"descriptionofGoods"`
	Amount             int    `json:"amount"`
	Beneficiary        string `json:"beneficiary"`
	SourcePort         string `json:"sourcePort"`
	DestinationPort    string `json:"destinationPort"`
}

type TradeAgreement struct {
	Amount             int    `json:"amount"`
	DescriptionofGoods string `json:"descriptionofGoods"`
	Payment            int    `json:"payment"`
	Status             string `json:"status"`
}

const (
	expKey    = "Exporter"
	ebKey     = "ExportersBank"
	expBalKey = "ExportersAccountBalance"
	impKey    = "Importer"
	ibKey     = "ImportersBank"
	impBalKey = "ImportersAccountBalance"
	carKey    = "Carrier"
	raKey     = "RegulatoryAuthority"
)

// State values
const (
	REQUESTED = "REQUESTED"
	ISSUED    = "ISSUED"
	ACCEPTED  = "ACCEPTED"
)

// Location values
const (
	SOURCE      = "SOURCE"
	DESTINATION = "DESTINATION"
)
