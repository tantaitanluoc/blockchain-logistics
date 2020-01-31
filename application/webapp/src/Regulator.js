import React, {Component} from 'react';
import axios from 'axios';
import Popup from "./Popup.js";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {ProgressDialogs,Loading} from './components/custom-form';
import Action from './ListAction.js'
import Drawer from './components/drawers.js'
import PropTypes from 'prop-types';
import ChartTemple from './components/chart';
import Profile from './components/profile';

import Box from '@material-ui/core/Box';

const styles = theme => ({
    root: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      minWidth: 650,
      maxHeight: 440,
    },
  });

  class Regulator extends Component {
    constructor (props) {
      super(props)
       this.state ={
            user_name:"",
            user_org:"",
            user_role:"",
            user_token:this.props.token,
            user_bal:0,
            data: [],
            loading:true,
            showPopup: false,
            currentRow: {},
            pageIndex:0,
            msgbox:false,
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
                  {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.state.user_token}`}}
              )
              .then(function (res) {
                  return res.data
              })
              .catch(function (error) {
                  console.log(error);
              });
              // return ta
          let bl = await axios.post('../list', 
                  {args:['BL']},
                  {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.state.user_token}`}}
              )
              .then(function (res) {
                  return res.data                    
              })
              .catch(function (error) {
                  console.log(error);
              });
          let cd = await axios.post('../list', 
                  {args:['CD']},
                  {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.state.user_token}`}}
              )
              .then(function (res) {
                  return res.data                    
              })
              .catch(function (error) {
                  console.log(error);
              });
          
          let el = await axios.post('../list', 
                  {args:['EL']},
                  {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.state.user_token}`}}
              )
              .then(function (res) {
                  return res.data                    
              })
              .catch(function (error) {
                  console.log(error);
              });
          let sl = await axios.post('../list', 
                  {args:['SL']},
                  {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.state.user_token}`}}
              )
              .then(function (res) {
                  return res.data                    
              })
              .catch(function (error) {
                  console.log(error);
              });
          return {user:info,ta:ta,bl:bl,cd:cd,el:el,sl:sl}
      }
  }
    renderData = (TA,CD,EL,BL,SL) =>{
        let tablex = []
        for (let i = 0;i<TA.length;i++){
          let id, status, cdstatus, fee, date, elstatus, placeShipment, purpose, action, goods, elexprdate, actor, payer, destination, location
          let note = 2
          id = TA[i].id
          status = TA[i].status
          goods = TA[i].descriptionofGoods
          placeShipment = TA[i].placeShipment
          date = TA[i].dateShipment
          for(let j= 0;j<CD.length;j++){
              if(CD[j].id === id){
                cdstatus = CD[j].status
                purpose = CD[j].purpose
                fee = CD[j].fee
              }
          }
          for(let j=0;j<EL.length;j++){
              if(EL[j].id === id){
                elstatus = EL[j].status
                elexprdate = EL[j].expDate
              }
          }
          for(let j = 0;j < BL.length;j++){
            if(BL[j].id === id) {
                payer = TA[i].payForShipment
                destination = BL[j].destinationPort
                if(BL[j].note === "PREPAID"){
                  note = 0;
                }
                if(BL[j].note === "COLLECT"){
                  note = 1;
                }
            } 
          }
    
          for(let o = 0;o<SL.length;o++){
            if(SL[o].id === id) {
                location = SL[o].Status
            }
          }
    
          if(TA[i].latestStep === "UpdateShipmentLocation" && destination !== location ){
                action = "UpdateShipmentLocation"
                actor = "CARRIERORG"
            }else{
              let arr = Action(TA[i].latestStep,note)
              action = arr.action
              if(action === "PayForPrepaidShippingFee" || action === "PayForCollectShippingFee"){
                payer = payer.toUpperCase()
                    if(payer === "IMPORTER" || payer === "IMPORTERORG" || payer === "IMPORTERBANK"){
                        actor = "IMPORTERBANKORG"
                    }
                    if(payer === "EXPORTER" || payer === "EXPORTERORG" || payer === "EXPORTERBANK"){
                    actor = "EXPORTERBANKORG"
                    }
            }else{
                actor = arr.actor
            }
          }
        if(action !== 'NotFound'){
          tablex.push({stt:i,id:id, date:date, fee:fee, status:status, placeShipment:placeShipment, purpose:purpose, destination:destination, cdstatus:cdstatus, goods:goods, elstatus:elstatus, elexprdate:elexprdate, action:action, actor:actor, note:note})
        }
      }
        return tablex
    }
    componentDidMount(){
        this.getData().then((value)=>{
            let data = this.renderData(value.ta, value.cd, value.el, value.bl, value.sl)
            this.setState({
                data:data,
                user_name:value.user.name,
                user_org:value.user.org,
                user_role:value.user.role,
                user_bal:value.user.bal,
                loading:false
                })
            })
    }
    onRowClick = (row) =>{
        let a 
        for(let i =0;i < this.state.data.length;i++){
            if(row.id === this.state.data[i].id){
                a=i
            }
        }
        this.setState({msgbox:true},()=>{
            if(this.state.currentRow !== this.state.data[a]){
                this.setState({currentRow: this.state.data[a]})
            }
        },()=>console.log(this.state.currentRow))
      }
  
    createData = (stt, id, elStatus, elexpr, cdStatus, action) =>{
        return { stt, id, elStatus, elexpr, cdStatus, action};
      }
  
    actionPopUP = (i) =>{
          this.setState({currentRow:this.state.data[i],showPopup:true},()=>this.onRowClick(this.state.data[i]))
      }

    classes = this.props
    onCloseDialogs() {
      this.setState({msgbox: false})
    };
    togglePopup = () =>{
      console.log(this.state.showPopup)
      this.setState({showPopup:!this.state.showPopup})
    }
    
    render(){
      let rows = []

      const handleNav = (index) =>{
        this.setState({pageIndex:index},()=>renderPage);
      }

      const home = () => {
                    return(
                      <div>{this.state.loading ?
                          <Loading open = {this.state.loading}/>
                          :
                          <Profile user={{name:this.state.user_name,role:this.state.user_role,org:this.state.user_org,bal:this.state.user_bal}} />
                      }
                      </div>
                    )
      }

      const table = (rows, title) =>{ 
                    return(
                    <div style={{ padding: 16, margin: 'auto'}}>
                        <Typography variant="h3" align="center" component="h1" gutterBottom>{title}</Typography>
                        <Paper className={this.classes.root}>
                        <Table stickyHeader className={this.classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell><Box fontWeight='fontWeightBold'> Stt</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> Id</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> EL Status</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> EL Expire</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> CD Status</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> Action</Box></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.stt} onClick={()=>{this.onRowClick(row)}}>
                                <TableCell align="center">{row.stt}</TableCell>
                                <TableCell align="center">{row.id}</TableCell>
                                <TableCell align="center">{row.elStatus}</TableCell>
                                <TableCell align="center">{row.elexpr}</TableCell>
                                <TableCell align="center">{row.cdStatus}</TableCell>
                                <TableCell align="center">{row.action}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                        </Paper>
                    </div>
                    )
      }

      let arr
      if(this.state.currentRow.note !== ""){
        arr = Action("", this.state.currentRow.note)
      }

      const progress = <ProgressDialogs
                          tradeID={this.state.currentRow.id}
                          steps={arr}
                          activeStep={this.state.currentRow.action}
                          button={this.state.currentRow.actor === "REGULATORORG"}
                          open={this.state.msgbox}
                          handleClose={()=> {this.onCloseDialogs()}}
                          function={()=>this.togglePopup()}
                          buttonLabel={this.state.currentRow.action}
                      />

      const popup = <Popup  
                        DataPopup={this.state.currentRow}
                        token={this.state.user_token}
                        openPopup={this.state.showPopup}
                        closePopup={()=>this.togglePopup()}
                        action={this.state.currentRow.action}
                      />
    
      const chart =(chart1Data,chart2Data) => {
                    return (
                      <div> 
                      <ChartTemple
                              type={"ColumnChart"}
                              data={chart1Data}
                              title={"Total Trade In a Year"}
                          />
                      <ChartTemple
                              type={"LineChart"}
                              data={chart2Data}
                              title={"Total Custom Declaration In a Year"}
                          />
                      </div>
                    )
      }

      const renderHome = () => {
        return home()
      }

      const renderAllTrade = () => {
          for (let i =0 ;i<this.state.data.length;i ++){
              rows.push(this.createData(this.state.data[i].stt + 1, this.state.data[i].id, this.state.data[i].elstatus, this.state.data[i].elexprdate, this.state.data[i].cdstatus, this.state.data[i].action))
          }
          return table(rows, "All Trade")
      }

      const renderAction1 = ()=> {
        for(let i = 0;i < this.state.data.length;i++){
                if(this.state.data[i].action === "IssueEL" ){
                    let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{this.state.data[i].action}</a>
                    rows.push(this.createData(this.state.data[i].stt+1, this.state.data[i].id, this.state.data[i].elstatus, this.state.data[i].elexprdate, this.state.data[i].cdstatus, butt))
                }
            }
          return table(rows, "Trade waiting for IssueEL")
      }

      const renderAction2 = ()=> {
        for(let i = 0;i < this.state.data.length;i++){
                if(this.state.data[i].action === "AcceptCD" ){
                    let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{this.state.data[i].action}</a>
                    rows.push(this.createData(this.state.data[i].stt, this.state.data[i].id, this.state.data[i].elstatus, this.state.data[i].elexprdate, this.state.data[i].cdstatus, butt))
                }
            }
        return table(rows,"Trade waiting for AcceptCD")
      }
      const renderStatics = () => {
        let chart1Data = []
        let chart2Data = []
        let tablexTemple =[]
        let t = 1
        let count = 0
        let money = 0
        var today = new Date();
        var yyyy = today.getFullYear();
        if(this.state.data.length === 0){
          for (let i=0 ; i<this.state.data.length; i++){
              let date = this.state.data[i].date.split("-")
              if(date[2] == yyyy ){
                  tablexTemple.push(this.state.data[i])
              }     
          }
        }
        chart1Data.push(["month", "trades in month"])
        chart2Data.push(["month", "$: "])
        while(t<13){
            count = 0
            money = 0
            if(tablexTemple.length !== 0){
              for (let i=0 ; i<tablexTemple.length; i++){
                  let date = tablexTemple[i].date.split("-")
                  if(date[0] == t){
                      count ++
                      if(tablexTemple[i].fee !== undefined){
                          money += parseInt(tablexTemple[i].fee)
                      }
                  }
              }
            }
                chart2Data.push([t,money])
                chart1Data.push([t,count])
            t++
        }
        return chart(chart1Data,chart2Data)
    }

    const renderPage = () =>{
          switch (this.state.pageIndex) {
            case 0:
              return renderHome();
            case 1:
              return renderAllTrade();
            case 2:
              return renderStatics();
            case 3:
              return renderAction1();
            case 4:
              return renderAction2();
          }
        }
      let body = renderPage()
      return (
        <div>
                <Drawer
                    logout = {()=>this.props.resetCookies()}
                    handleNav = {(index)=>{handleNav(index)}} 
                    info = {[this.state.user_name,this.state.user_role,this.state]}
                    items = {['Home','All Trade','Statics','IssueEL', 'AcceptCD']}
                    popUpState={this.state.showPopup}
                    progress={progress}
                    body ={body}
                    ta={this.state.data}
                    org={'CARRIERORG'}
                    progress ={progress}
                    popup ={popup}
                    pageIndex={this.state.pageIndex}
                    view ={"REGULATOR"}
                />
            </div>
      )
    }
}
Regulator.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Regulator);