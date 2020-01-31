import React from 'react';
import './components/components.css';
import GetTradeStatus from './components/get-trade-status';
import RequestTrade from './components/request-trade';
import RequestLC from './components/request-lc';
import Profile from './components/profile';
import Drawer from './components/drawers.js'
import axios from 'axios';
import ChartTemple from './components/chart';
import {Loading} from './components/custom-form';
import Action from './ListAction.js'



class Importer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      components: 0,
      user_role:"",
      user_name:"",
      user_org:"",
      user_bal:0,
      ta: [],
      cd: [],
      loading: true,
    }
    this.getData = async () =>{
      let info = await axios.post('../info', 
                    {},
                    {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.props.token}`}}
                )
                .then(function (res) {
                    let value = res.data 
                    let bal = JSON.parse(value.balance)
                    return {role:value.role, name:value.name, org:value.org, bal:bal.Balance}
                })
                .catch(function (error) {
                    console.log(error);
                });
    
      let ta = await axios.post('../list', 
                    {args:['TA']},
                    {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.props.token}`}}
                )
                .then(function (res) {
                    return res.data
                })
                .catch(function (error) {
                    console.log(error);
                });
      let bl = await axios.post('../list', 
                {args:['BL']},
                {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.props.token}`}}
            )
            .then(function (res) {
                return res.data                    
            })
            .catch(function (error) {
                console.log(error);
            });
      // let lc = await axios.post('../list', 
      //           {args:['LC']},
      //           {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.props.token}`}}
      //       )
      //       .then(function (res) {
      //           return res.data                    
      //       })
      //       .catch(function (error) {
      //           console.log(error);
      //     });
      return {user:info,ta:ta, bl:bl}
    }
  }
  renderData(){
    let ta = this.state.ta
    let bl = this.state.bl
    for(let i=0;i<ta.length;i++){
        let note = 2
        let payer = ta[i].payForShipment
        for(let j = 0;j < bl.length;j++){
            if(bl[j].id === ta[i].id) {
                // listPort.push(destination)
                if(bl[j].note === "PREPAID"){
                    note = 0
                    //  console.log(id +"-"+BL[j].note+"-"+note)
                }
                if(bl[j].note === "COLLECT"){
                    note = 1
                }
            }
            
        }
        let act = Action(ta[i].latestStep,note)
        let action = act.action
        let actor
        if(action === "PayForPrepaidShippingFee" || action === "PayForCollectShippingFee"){
            payer = payer.toUpperCase()
                if(payer === "IMPORTER" || payer === "IMPORTERORG" || payer === "IMPORTERBANK"){
                    actor = "IMPORTERBANKORG"
                }
                if(payer === "EXPORTER" || payer === "EXPORTERORG" || payer === "EXPORTERBANK"){
                actor = "EXPORTERBANKORG"
                }
        }else{
            actor = act.actor
        }
        ta[i].action = action
        ta[i].actor = actor
    }


    this.setState({ta:ta})
    
}
  componentDidMount(){
    this.getData().then((value)=>{
        this.setState({
            ta:value.ta,
            bl:value.bl,
            // lc:value.lc,
            user_name:value.user.name,
            user_org:value.user.org,
            user_role:value.user.role,
            user_bal:value.user.bal,
            loading:false
            },()=>this.renderData())
        })
  }
  handleNav(index){
    this.setState({components:index});
  }

  renderStatistic(){
    let data = this.state.ta
    let chart1Data = []
    let chart2Data = []
    let dataTemple =[]
    let t = 1
    let count = 0
    let goods = 0
    var today = new Date();
    var yyyy = today.getFullYear();
    if(data.length === 1 && data[0].action === 'NotFound'){
        chart2Data.push([0,0])
        chart1Data.push([0,0])
    }
    else{
        for (let i=0 ; i<data.length; i++){
            let date = data[i].dateShipment.split("-")
            if(date[2] == yyyy ){
                dataTemple.push(data[i])
            }     
        }
        chart1Data.push(["month", "trades in month"])
        chart2Data.push(["month", "count: "])
        while(t<13){
            count = 0
            goods = 0
            for (let i=0 ; i<dataTemple.length; i++){
                let date = dataTemple[i].dateShipment.split("-")
                // console.log(date)
                if(date[0] == t){
                    count ++
                    if(dataTemple[i].amount !== undefined){
                        goods += parseInt(dataTemple[i].amount)
                    }
                }
            }
                chart2Data.push([t,goods])
                chart1Data.push([t,count])
            t++
        }
    }
      return <div>
              <ChartTemple
                  type={"ColumnChart"}
                  data={chart1Data}
                  title={"Total Trade In a Year"}
              />
              <ChartTemple
                  type={"ColumnChart"}
                  data={chart2Data}
                  title={"Total amount of goods In a Year"}
              />

              </div>
    
  }
  renderPage(){
    switch (this.state.components) {
      case 0:
      return <div>
                    {this.state.loading ?
                         <Loading 
                            open = {this.state.loading}
                            loading_msg = "Loading assets..."
                        />
                        :
                        <Profile user={{name:this.state.user_name,role:this.state.user_role,org:this.state.user_org,bal:this.state.user_bal}} />
                    }
             </div>
      case 1:
      return <GetTradeStatus ta={this.state.ta} bl={this.state.bl} />
      case 2:
      return this.renderStatistic(this)
      case 3:
      return <RequestTrade />
      case 4:
      return <RequestLC ta={this.state.ta} />
    }
  }
  render(){
      let body = this.renderPage()
      return (
        <div>
        <Drawer
                logout = {()=>this.props.logout()}
                handleNav = {(index)=>{this.handleNav(index)}}
                ta={this.state.ta}
                org ={'IMPORTERORG'}
                info = {[this.state.user_name,this.state.user_role]}
                items = {['Home','All Trade','Statics','RequestTrade', 'RequestLC']}
                popUpState={this.state.showPopup}
                body ={body}
                view ={"Importer"}
             />
        </div>
    );
  }
}



export default Importer;
