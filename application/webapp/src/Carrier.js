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
import {ProgressDialogs, Loading} from './components/custom-form';
import ChartTemple from './components/chart';
import Profile from './components/profile';

import Action from './ListAction.js'
import Drawer from './components/drawers.js'
import PropTypes from 'prop-types';

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

class Carrier extends Component {
    constructor (props) {
        super(props)
        this.state ={
            user_name:"",
            user_org:"",
            user_role:"",
            user_token:this.props.token,
            data:[],
            showPopup: false,
            ActionPopup:"",
            DataPopup: "",
            showListStep:false,
            currentRow: {},
            pageIndex:0,
            msgbox:false,
            view:false,
            loading:true,
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
            let loc = await axios.post('../query/getShipmentLocation', 
                    {ccversion:'v0',args:['001']},
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

            return {user:info,ta:ta,bl:bl,sl:sl}
        }

    }
    renderData = (TA,BL,SL)=> {
        let tablex = []
        for(let i = 0;i < TA.length;i++){
            let id, status, blstatus, fee, action, listPort, date, amount, actor, descriptionofGoods, payer, location, destination
            let note = 2
            id = TA[i].id
            status = TA[i].status
            amount = TA[i].amount
            date = TA[i].dateShipment
            descriptionofGoods = TA[i].descriptionofGoods
            destination = TA[i].placeShipment
            payer = TA[i].payForShipment
            // console.log(status+"-"+TS[i].status)
            for(let j = 0;j < BL.length;j++){
                if(BL[j].id === id) {
                    // console.log(BL[j].id +"-"+BL[j].status+"-"+status)
                    blstatus = BL[j].status
                    listPort = BL[j].portOnTransport
                    fee = BL[j].fee
                    // listPort.push(destination)
                    if(BL[j].note === "PREPAID"){
                        note = 0
                        //  console.log(id +"-"+BL[j].note+"-"+note)
                    }
                    if(BL[j].note === "COLLECT"){
                        note = 1
                    }
                }
                
            }
            for(let o = 0;o<SL.length;o++){
                if(SL[o].id === id) {
                    location = SL[o].Status
                }
            }
            // console.log(id+"= "+note)
            if(TA[i].latestStep === "UpdateShipmentLocation" && destination !== location ){
                // console.log(location, destination)
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


            // console.log(action+"-"+this.getNextActor(action))
            if(action !== 'NotFound'){
                tablex.push({stt:i, payer:payer, id:id, fee:fee, date:date, listPort:listPort, amount:amount, status:status, goods:descriptionofGoods, BLstatus:blstatus, location:location, destination:destination, action:action, actor:actor,note:note})
            }
                // console.log(tablex)
        }
        return tablex
    }
    componentDidMount(){
        this.getData().then((value)=>{
            let data = this.renderData(value.ta, value.bl, value.sl)
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
        })

    }

    createData = (stt, id, blStatus, descriptionofGoods, location, action) =>{
        return { stt, id, blStatus, descriptionofGoods, location, action};
    }

    actionPopUP = (i) =>{
        this.setState({currentRow:this.state.data[i],showPopup:true},()=>this.onRowClick(this.state.data[i]))
    }

    classes=this.props

    onCloseDialogs = () =>{
        this.setState({msgbox: false})
      };
    togglePopup = () =>{
        this.setState({showPopup:!this.state.showPopup},()=>console.log(this.state.showPopup))
    }

        
    render () {
        let rows = []
        let arr = []
        if(this.state.currentRow.note !== ""){
            arr = Action("", this.state.currentRow.note)
        }
        const handleNav = (index) =>{
            this.setState({pageIndex:index},renderPage);
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
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> BL Status</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> description of Goods</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> Location</Box></TableCell>
                                <TableCell align="center"><Box fontWeight='fontWeightBold'> Action</Box></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.stt} onClick={()=>{this.onRowClick(row)}}>
                                <TableCell align="center" component="th" scope="row">{row.stt}</TableCell>
                                <TableCell align="center">{row.id}</TableCell>
                                <TableCell align="center">{row.blStatus}</TableCell>
                                <TableCell align="center">{row.descriptionofGoods}</TableCell>
                                <TableCell align="center">{row.location}</TableCell>
                                <TableCell align="center">{row.action}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                        </Paper>
                    </div>
            )
        }
        const progress = <ProgressDialogs
                          tradeID={this.state.currentRow.id}
                          steps={arr}
                          activeStep={this.state.currentRow.action}
                          button={this.state.currentRow.actor === "CARRIERORG"}
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
                        title={"Total Trade In a Year"}
                    />
                </div>
            )
        }
        const renderHome = () => {
            return home()
        }
        const renderAllTrade = () => {
            let tablex = this.state.data
            for (let i =0 ;i<tablex.length;i ++){
                rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].BLstatus, tablex[i].goods, tablex[i].location, tablex[i].action))
            }
            return table(rows,"All Trade")
        }
        
        const renderStatics = () =>{
            let tablex = this.state.data
            let tablexTemple =[]
            let chart1Data = []
            let chart2Data = []
            let t = 1
            let count = 0
            let money = 0
            var today = new Date();
            var yyyy = today.getFullYear();
            if(this.state.data.length === 0){
                for (let i=0 ; i<tablex.length; i++){
                    let date = tablex[i].date.split("-")
                    if(date[2] == yyyy ){
                        tablexTemple.push(tablex[i])
                    }     
                }
            }
            // console.log(yyyy, tablexTemple)
            chart1Data.push(["month", "trades in month"])
            chart2Data.push(["month", "$: "])
            while(t<13){
                count = 0
                money = 0
                if(tablexTemple.length !== 0){
                    for (let i=0 ; i<tablexTemple.length; i++){
                        let date = tablexTemple[i].date.split("-")
                        // console.log(date[0])
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
            // console.log(chart1Data,chart2Data)
            return chart(chart1Data,chart2Data)

        }
        
        
        const renderAction1 = ()=> {
            let tablex = this.state.data
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "AcceptShipmentAndIssueBL" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].BLstatus, tablex[i].goods, tablex[i].location, butt))
                    }
                }
            return table(rows, "Trade waiting for AcceptShipmentAndIssueBL")
        }

        const renderAction2 = ()=> {
            let tablex = this.state.data
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "RequestCollectShippingFee" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].BLstatus, tablex[i].goods, tablex[i].location, butt))
                    }
                }
                return table(rows, "Trade waiting for RequestCollectShippingFee")
        }

        const renderAction3 = ()=> {
            let tablex = this.state.data
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "UpdateShipmentLocation" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].BLstatus, tablex[i].goods, tablex[i].location, butt))
                    }
                }
                return table(rows, "Trade waiting for UpdateShipmentLocation")
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
              case 5:
                return renderAction3();
            }
        }

        let body = renderPage()

        return(
        <div>
        <Drawer
            logout = {()=>this.props.resetCookies()}
            handleNav = {(index)=>{handleNav(index)}} 
            info = {[this.state.user_name,this.state.user_role,this.state]}
            items = {['Home','All Trade','Statics','Accept Shipment And IssueBL', 'Request Collect Shipping Fee', 'Update Shipment Location']}
            popUpState={this.state.showPopup}
            progress={progress}
            body ={body}
            progress ={progress}
            ta={this.state.data}
            org ={'CARRIERORG'}
            popup ={popup}
            pageIndex={this.state.pageIndex}
            view ={"Carrier"}
        />
    </div>
        );
    }
}
Carrier.propTypes = {
    classes: PropTypes.object.isRequired,
  };
export default withStyles(styles)(Carrier);
