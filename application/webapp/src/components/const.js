// hằng số
export const Server = {
    login_path: '../login',
    register: '../register',
    create_channel: '../channel/create',
    join_channel: '../channel/join',
    install_chaincode: '../chaincode/install',
    instantiate_chaincode: '../chaincode/instantiate',
    invoke_chaincode: '../invoke',
    query_chaincode: '../query',
    list: '../list',
    request_trade: '../invoke/requestTrade',
    accept_trade: '../invoke/acceptTrade',
    request_lc: '../invoke/requestLC',
    issue_lc: '../invoke/issueLC',
    request_el: '../invoke/requestEL',
    request_cd: '../invoke/requestCustomsDeclaration',
    prepare_shipment: '../invoke/prepareShipment',
    getBL: '../query/getBL',
    makePayment: '../invoke/makePayment',
    get_account_balance: '../query/getAccountBalance',
    prepaid: '../invoke/payForPreShippingFee',
    collect: '../invoke/payForCollectShippingFee'
};
export const Chaincode = {
    version: 'v0',
    actor:{
        RequestTrade:{value: "IMPORTERORG"},
        AcceptTrade:{value: "EXPORTERORG"},
        RequestLC:{value: "IMPORTERORG"},
        IssueLC:{value: "IMPORTERBANKORG"},
        AcceptLC:{value: "EXPORTERBANKORG"},
        RequestEL:{value: "EXPORTERORG"},
        IssueEL:{value: "REGULATORORG"},
        PrepareShipment:{value: "EXPORTERORG"},
        RequestHalfPayment:{value: "EXPORTERBANKORG"},
        MakeHalfPayment:{value: "IMPORTERBANKORG"},
        AcceptShipmentAndIssueBL:{value: "CARRIERORG"},
        RequestCD:{value: "EXPORTERORG"},
        AcceptCD:{value: "REGULATORORG"},
        PayForCD:{value: "EXPORTERBANKORG"},
        RequestCollectShippingFee:{value: "CARRIERORG"},
        PayForCollectShippingFee:{value: "IMPORTERORG"},
        UpdateShipmentLocation:{value: "CARRIERORG"},
        RequestLastPayment:{value: "EXPORTERBANKORG"},
        MakeLastPayment:{value: "IMPORTERBANKORG"},
   },
    ccpath: 'github.com/logistics',
    list_initial_steps:{
        RequestTrade : {index: 0, name: "Request Trade", next: "AcceptTrade"},
        AcceptTrade : {index: 1, name: "Accept Trade",next: "RequestLC"},
        RequestLC : {index: 2, name: "Request LC", next: "IssueLC"},
        IssueLC : {index: 3, name: "Issue LC", next: "AcceptLC"},
        AcceptLC : {index: 4, name: "Accept LC", next: "RequestEL"},
        RequestEL : {index: 5, name: "Request EL", next: "IssueEL"},
        IssueEL : {index: 6, name: "Issue EL", next: "PrepareShipment"},
        PrepareShipment : {index: 7, name: "Prepare Shipment", next: "RequestCD"},
        RequestCD : {index: 8, name: "Request CD", next: "AcceptCD"},
        AcceptCD : {index: 9, name: "Accept CD", next: "PayForCD"},
        PayForCD : {index: 10, name: "Pay For CD", next: "AcceptShipmentAndIssueBL"},
        AcceptShipmentAndIssueBL : {index: 11, name: "Accept Shipment And Issue BL", next: "Next"},
        Next : {index: 12, name :"Next...", next: ""},
    },
    list_steps_for_to_collect:{
        RequestTrade : {index: 0, name: "Request Trade", next: "AcceptTrade"},
        AcceptTrade : {index: 1, name: "Accept Trade",next: "RequestLC"},
        RequestLC : {index: 2, name: "Request LC", next: "IssueLC"},
        IssueLC : {index: 3, name: "Issue LC", next: "AcceptLC"},
        AcceptLC : {index: 4, name: "Accept LC", next: "RequestEL"},
        RequestEL : {index: 5, name: "Request EL", next: "IssueEL"},
        IssueEL : {index: 6, name: "Issue EL", next: "PrepareShipment"},
        PrepareShipment : {index: 7, name: "Prepare Shipment", next: "RequestCD"},
        RequestCD : {index: 8, name: "Request CD", next: "AcceptCD"},
        AcceptCD : {index: 9, name: "Accept CD", next: "PayForCD"},
        PayForCD : {index: 10, name: "Pay For CD", next: "AcceptShipmentAndIssueBL"},
        AcceptShipmentAndIssueBL : {index: 11, name: "Accept Shipment And Issue BL", next: "RequestHalfPayment"},
        RequestHalfPayment : {index: 12, name: "Request Payment (first-half)", next: "MakeHalfPayment"},
        MakeHalfPayment : {index: 13, name: "Make Payment (first-half)", next: "UpdateShipmentLocation"},
        UpdateShipmentLocation : {index: 14, name: "Update Shipment Location", next: "RequestCollectShippingFee"},
        RequestCollectShippingFee : {index: 15, name: "Request Collect Shipping Fee", next: "PayForCollectShippingFee"},
        PayForCollectShippingFee : {index: 16, name: "Pay For Collect Shipping Fee", next: "RequestLastPayment"},
        RequestLastPayment : {index: 17, name: "Request Last Payment", next: "MakeLastPayment"},
        MakeLastPayment : {index: 18, name: "Make Last Payment", next: "Finish"},
    },
    list_steps_for_prepaid:{
        RequestTrade : {index: 0, name: "Request Trade", next: "AcceptTrade"},
        AcceptTrade : {index: 1, name: "Accept Trade",next: "RequestLC"},
        RequestLC : {index: 2, name: "Request LC", next: "IssueLC"},
        IssueLC : {index: 3, name: "Issue LC", next: "AcceptLC"},
        AcceptLC : {index: 4, name: "Accept LC", next: "RequestEL"},
        RequestEL : {index: 5, name: "Request EL", next: "IssueEL"},
        IssueEL : {index: 6, name: "Issue EL", next: "PrepareShipment"},
        PrepareShipment : {index: 7, name: "Prepare Shipment", next: "RequestCD"},
        RequestCD : {index: 8, name: "Request CD", next: "AcceptCD"},
        AcceptCD : {index: 9, name: "Accept CD", next: "PayForCD"},
        PayForCD : {index: 10, name: "Pay For CD", next: "AcceptShipmentAndIssueBL"},
        AcceptShipmentAndIssueBL : {index: 11, name: "Accept Shipment And Issue BL", next: "PayForPrepaidShippingFee"},
        PayForPrepaidShippingFee : {index: 12, name: "Pay For Prepaid Shipping Fee", next: "RequestHalfPayment"},
        RequestHalfPayment : {index: 13, name: "Request Payment (first-half)", next: "MakeHalfPayment"},
        MakeHalfPayment : {index: 14, name: "Make Payment (first-half)", next: "UpdateShipmentLocation"},
        UpdateShipmentLocation : {index: 15, name: "Update Shipment Location", next: "RequestLastPayment"},
        RequestLastPayment : {index: 16, name: "Request Last Payment", next: "MakeLastPayment"},
        MakeLastPayment : {index: 17, name: "Make Last Payment", next: "Finish"},
    },
    list_ports:[
        {US_NYC: "New York"},
        {VN_HCMC: "Ho Chi Minh"},
        {CN_SH: "Shanghai"},
        {UAE_DB: "Dubai"},
        {SP_SP: "Singapore"},
        {US_LA: "Los Angeles"},
        {KR_BS: "Busan"}
    ],
    currencies:[
        {
            value: 'USD',
            label: '$',
        },
        {
            value: 'EUR',
            label: '€',
        }, 
        {
            value: 'BTC',
            label: '฿',
        },
        {
            value: 'JPY',
            label: '¥',
        },
        {
            value: 'VND',
            label: '₫',
        }
    ]
}

// utils
export const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const formatDate = date =>{
    return `${(date.getMonth()+1)<10?'0'+(date.getMonth()+1):(date.getMonth()+1)}-${date.getDate()<10?'0'+date.getDate():date.getDate()}-${date.getFullYear()}`;
}
