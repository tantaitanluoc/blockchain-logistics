const nextActionPrepaid = {
    RequestTrade:"AcceptTrade",
    AcceptTrade:"RequestLC",
    RequestLC: "IssueLC",
    IssueLC:"AcceptLC",
    AcceptLC:"RequestEL",
    RequestEL:"IssueEL",
    IssueEL:"PrepareShipment",
    PrepareShipment:"RequestCD",
    RequestCD:"AcceptCD",
    AcceptCD:"PayForCD",
    PayForCD:"AcceptShipmentAndIssueBL",
    AcceptShipmentAndIssueBL: "PayForPrepaidShippingFee",
    PayForPrepaidShippingFee: "RequestHalfPayment",
    RequestHalfPayment:"MakeHalfPayment",
    MakeHalfPayment:"UpdateShipmentLocation",
    UpdateShipmentLocation: "RequestLastPayment",
    RequestLastPayment: "MakeLastPayment",
    MakeLastPayment: "Done"
}
const nextActioncollect = {
    RequestTrade:"AcceptTrade",
    AcceptTrade:"RequestLC",
    RequestLC: "IssueLC",
    IssueLC:"AcceptLC",
    AcceptLC:"RequestEL",
    RequestEL:"IssueEL",
    IssueEL:"PrepareShipment",
    PrepareShipment:"RequestCD",
    RequestCD:"AcceptCD",
    AcceptCD:"PayForCD",
    PayForCD:"AcceptShipmentAndIssueBL",
    AcceptShipmentAndIssueBL: "RequestHalfPayment",
    RequestHalfPayment:"MakeHalfPayment",
    MakeHalfPayment:"UpdateShipmentLocation",
    UpdateShipmentLocation: "RequestCollectShippingFee",
    RequestCollectShippingFee: "PayForCollectShippingFee",
    PayForCollectShippingFee: "RequestLastPayment",
    RequestLastPayment: "MakeLastPayment",
    MakeLastPayment:"Done"
}
const nextActionNotBL = {
    RequestTrade:"AcceptTrade",
    AcceptTrade:"RequestLC",
    RequestLC: "IssueLC",
    IssueLC:"AcceptLC",
    AcceptLC:"RequestEL",
    RequestEL:"IssueEL",
    IssueEL:"PrepareShipment",
    PrepareShipment:"RequestCD",
    RequestCD:"AcceptCD",
    AcceptCD:"PayForCD",
    PayForCD:"AcceptShipmentAndIssueBL",
    AcceptShipmentAndIssueBL:"Done"
  }
const numberPaperInStep = [
  {name:"RequestTrade",number:1,},
  {name:"AcceptTrade",number:1,},
  {name:"RequestLC",number: 2,},
  {name:"IssueLC",number:2,},
  {name:"AcceptLC",number:2,},
  {name:"RequestEL",number:3,},
  {name:"IssueEL",number:3,},
  {name:"PrepareShipment",number:3,},
  {name:"RequestCD",number:4,},
  {name:"AcceptCD",number:4,},
  {name:"PayForCD",number:4,},
  {name:"AcceptShipmentAndIssueBL",number: 5,},
  {name:"PayForPrepaidShippingFee",number: 5,},
  {name:"RequestHalfPayment",number:5,},
  {name:"MakeHalfPayment",number:5,},
  {name:"UpdateShipmentLocation",number: 5,},
  {name:"RequestLastPayment",number: 5,},
  {name:"MakeLastPayment",number: 5},
  {name:"Done", number:5}
]
const paperInStep = (step) => {
  let len = numberPaperInStep.length
  let number
  for(let i = 0; i < len; i++){
    if(numberPaperInStep[i].name === step){
      number = numberPaperInStep[i].number
    }
  }
  let arr = ["ta","lc","el","cd","bl"]
  return(arr.slice(0,number))
}
const getNextAction = (arg, note) => {
    let nextAction
    if(note === 0 ){
      // nextAction = this.nextActioncollect
      nextAction = nextActionPrepaid
    }
    else if(note === 1){
      nextAction = nextActioncollect
      // nextAction = this.nextActionPrepaid
    }
    else if(note === 2){
      nextAction = nextActionNotBL
    }
    else {
      return "Done"
    }
    switch(arg){
        case "RequestTrade": return nextAction.RequestTrade
        case "AcceptTrade": return nextAction.AcceptTrade
        case "RequestLC": return nextAction.RequestLC
        case "IssueLC": return nextAction.IssueLC
        case "AcceptLC": return nextAction.AcceptLC
        case "RequestEL": return nextAction.RequestEL
        case "IssueEL": return nextAction.IssueEL
        case "PrepareShipment": return nextAction.PrepareShipment
        case "RequestHalfPayment":return nextAction.RequestHalfPayment
        case "MakeHalfPayment":return nextAction.MakeHalfPayment
        case "PayForPrepaidShippingFee": return nextAction.PayForPrepaidShippingFee
        case "AcceptShipmentAndIssueBL": return nextAction.AcceptShipmentAndIssueBL
        case "UpdateShipmentLocation" : return nextAction.UpdateShipmentLocation
        case "RequestCD":return nextAction.RequestCD
        case "AcceptCD":return nextAction.AcceptCD
        case "PayForCD":return nextAction.PayForCD
        case "RequestCollectShippingFee":return nextAction.RequestCollectShippingFee
        case "PayForCollectShippingFee":return nextAction.PayForCollectShippingFee
        case "RequestLastPayment": return nextAction.RequestLastPayment
        case "MakeLastPayment": return nextAction.MakeLastPayment
        default: return "NotFound"
    }

}

const getNextActor =(arg) => {
    switch(arg){
        case "RequestTrade": return "IMPORTERORG"
        case "AcceptTrade": return "EXPORTERORG"
        case "RequestLC": return "IMPORTERORG"
        case "IssueLC": return "IMPORTERBANKORG"
        case "AcceptLC": return "EXPORTERBANKORG"
        case "RequestEL": return "EXPORTERORG"
        case "IssueEL": return "REGULATORORG"
        case "PrepareShipment": return "EXPORTERORG"
        case "RequestHalfPayment":return "EXPORTERBANKORG"
        case "MakeHalfPayment":return "IMPORTERBANKORG"
        case "AcceptShipmentAndIssueBL": return "CARRIERORG"
        case "RequestCD":return "EXPORTERORG"
        case "AcceptCD":return "REGULATORORG"
        case "PayForCD":return "EXPORTERBANKORG"
        case "RequestCollectShippingFee":return "CARRIERORG"
        case "UpdateShipmentLocation": return "CARRIERORG"
        case "RequestLastPayment" :return "EXPORTERBANKORG"
        case "MakeLastPayment" :return "IMPORTERBANKORG"
        default: return "NotFound"
    }
}

const ListStep = (note) => {
  let arr = ["RequestTrade"]
  let firstStep = "RequestTrade"
  let nextStep = ""
  while(firstStep !== "Done"){
    nextStep = getNextAction(firstStep,note)
    if(nextStep !=="Done"){
        arr.push(nextStep)
    }
    firstStep = nextStep
  }
  return(arr)
}

const Action = (arg, note) => {
  if(arg === "paper") {
    return paperInStep(note)
  }
  if(arg === ""){
    
    return ListStep(note)
  }else{
    let action = getNextAction(arg, note)
    let actor = getNextActor(action)
    // console.log(arg, note, action, actor)
    return({action:action,actor:actor})
  }
};

export default Action