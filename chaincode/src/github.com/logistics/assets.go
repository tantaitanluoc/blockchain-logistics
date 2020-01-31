package main

type LetterofCredit struct {
	ID          string `json:"id"`
	IssDate     string `json:"issDate"`
	ExpDate     string `json:"expDate"`
	IssBank     string `json:"issBank"`
	Beneficiary string `json:"beneficiary"` // Ben thu huong
	Amount      int    `json:"amount"`
	Assurances  string `json:"assurances"`
	Status      string `json:"status"`
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
	ID                   string `json:"id"`
	IssDate              string `json:"issDate"`
	ExpDate              string `json:"expDate"`
	Exporter             string `json:"exporter"`
	Importer             string `json:"importer"`
	Carrier              string `json:"carrier"`
	DescriptionofCarrier string `json:"descriptionofCarrier"`
	DescriptionofGoods   string `json:"descriptionofGoods"`
	Amount               int    `json:"amount"`
	Beneficiary          string `json:"beneficiary"`
	Payer                string `json:"payer"`
	FeeOfShipment        int    `json:"fee"`
	Note                 string `json:"note"` // Freight prepaid (trả trước - exporter) || Freight to collect (trả sau - importer)))
	SourcePort           string `json:"sourcePort"`
	PortOnTransport	   []string `json:"portOnTransport"`
	DestinationPort      string `json:"destinationPort"`
	Status               string `json:"status"`
}

type TradeAgreement struct {
	ID                 string `json:"id"`
	IssDate            string `json:"issDate"`
	Exporter           string `json:"exporter"`
	Importer           string `json:"importer"`
	DescriptionofGoods string `json:"descriptionofGoods"`
	Amount             int    `json:"amount"`
	Price              int    `json:"price"`
	Currency           string `json:"currency"`
	Paid               int    `json:"paid"`
	PayForShipment     string `json:"payForShipment"`
	DateShipment       string `json:"dateShipment"`
	PlaceShipment      string `json:"placeShipment"`
	LatestStep	string `json:"latestStep"`
	Status             string `json:"status"`
}

type TradeProcess struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

type ShipStatus struct {
	ID     string `json:"id"`
	Status string `json:"status`
}

type CustomsDeclaration struct {
	ID                 string `json:"id"`
	IssDate            string `json:"issDate"`
	Exporter           string `json:"exporter"`
	Importer           string `json:"importer"`
	Carrier            string `json:"carrier"`
	Regulatory         string `json:"regulatory"`
	TypeofPaper        string `json:"typeofPaper"`
	purpose            string `json:"purpose"`
	DescriptionofGoods string `json:"descriptionofGoods"`
	SourcePort         string `json:"sourcePort"`
	DestinationPort    string `json:"destinationPort"`
	Payer              string `json:"payer"`
	Fee                int    `json:"fee"`
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
	carBalKey = "CarriersAccountBalance"
	raKey     = "RegulatoryAuthority"
	raBalKey  = "RegulatorAccountBalance"
	listKey   = "listAgreementKey"
)

// State values
const (
	REQUESTED  = "REQUESTED"
	ISSUED     = "ISSUED"
	PAYREQUEST = "PAYREQUEST"
	ACCEPTED   = "ACCEPTED"
	PAID       = "PAID"
	HALFPAID   = "HALFPAID"
)

// Location values
const (
	SOURCE      = "SOURCE"
	DESTINATION = "DESTINATION"
)

// Shipping payment
const (
	PREPAID   = "PREPAID"
	TOCOLLECT = "COLLECT"
)

const (
	REQUEST_TRADE = "RequestTrade"
	ACCEPT_TRADE = "AcceptTrade"
	REQUEST_LC = "RequestLC"
	ISSUE_LC = "IssueLC"
	ACCEPT_LC = "AcceptLC"
	REQUEST_EL = "RequestEL"
	ISSUE_EL = "IssueEL"
	PREPARE_SHIPMENT = "PrepareShipment"
	ACCEPT_SHIPMENT = "AcceptShipmentAndIssueBL"
	PAY_FOR_PREPAID = "PayForPrepaidShippingFee"
	REQUEST_HALF_PAYMENT = "RequestHalfPayment"
	REQUEST_LAST_PAYMENT = "RequestLastPayment"
	REQUEST_COLLECT_SHIPPING_FEE = "RequestCollectShippingFee"
	MAKE_HALF_PAYMENT = "MakeHalfPayment"
	MAKE_LAST_PAYMENT = "MakeLastPayment"
	PAY_FOR_COLLECT_SHIPPING_FEE = "PayForCollectShippingFee"
	UPDATE_LOCATION = "UpdateShipmentLocation"
	REQUEST_CD = "RequestCD"
	ACCEPT_CD = "AcceptCD"
	PAY_FOR_CD = "PayForCD"

)