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
import Action from './ListAction.js'
import Drawer from './components/drawers.js'
import PropTypes from 'prop-types';
import Profile from './components/profile';

import Box from '@material-ui/core/Box';
import ChartTemple from './components/chart';


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

class Exporterbank extends Component {
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
            let lc = await axios.post('../list', 
                {args:['LC']},
                    {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.state.user_token}`}}
                )
                .then(function (res) {
                   return res.data
                })
                .catch(function (error) {
                    console.log(error);
                });
            return {user:info,ta:ta,bl:bl,cd:cd,sl:sl,lc:lc}
        }
        
    }
    renderData = (TA,BL,LC,SL,CD) => {
        let tablex = []
        for (let i = 0;i<TA.length;i++){
            let id, status,lcstatus, action, actor, date, shipfee, payer, tradeFee, cdFee, lcissue, lcexpr, destination, location
            let note = 2
            id = TA[i].id
            status = TA[i].status
            tradeFee = TA[i].amount*TA[i].price
            date = TA[i].dateShipment
            
            for(let j=0;j<LC.length;j++){
                if(LC[j].id === id){
                    // console.log(LC[j])
                    lcstatus = LC[j].status
                    lcissue = LC[j].issDate
                    lcexpr = LC[j].expDate
                }
            }
            for(let j = 0;j < BL.length;j++){
                if(BL[j].id === id) {
                    shipfee = BL[j].fee
                    destination = BL[j].destinationPort
                    if(BL[j].note === "PREPAID"){
                        note = 0
                    }
                    if(BL[j].note === "COLLECT"){
                        note = 1
                    }
                }
            }
            // console.log(CD.length)
            for(let j= 0;j<CD.length;j++){
                if(CD[j].id === id){
                    cdFee = CD[j].fee
                }
            }

            for(let o = 0;o<SL.length;o++){
                if(SL[o].id === id) {
                    location = SL[o].Status
                    // console.log(SL[o])
                }
            }

            payer = TA[i].payForShipment
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
                tablex.push({stt:i,id:id, cdFee:cdFee, shipFee:shipfee, date:date, status:status, tradeFee:tradeFee, lcstatus:lcstatus, issueDate:lcissue, expDate:lcexpr, action:action, actor:actor, note:note, })
            }
        }
        return tablex
    }
    componentDidMount(){
        this.getData().then((value)=>{
            let data = this.renderData(value.ta, value.bl, value.lc, value.sl, value.cd)
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

    createData = (stt, id, issue, expr, action, note, actor) =>{
        return { stt, id, issue, expr, action, note, actor};
    }

    actionPopUP = (i) =>{
        this.setState({currentRow:this.state.data[i],showPopup:true},()=>this.onRowClick(this.state.data[i]))
    }

    classes=this.props

    onCloseDialogs = () =>{
        this.setState({msgbox: false})
      };
    togglePopup = () =>{
        this.setState({showPopup:!this.state.showPopup})
    }

    render(){

        let rows = []
        let arr
        if(this.state.currentRow.note !== ""){
            arr = Action("", this.state.currentRow.note)
        }
        const handleNav = (index) =>{
            this.setState({pageIndex:index},renderPage);
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
                            <TableCell align="center"><Box fontWeight='fontWeightBold'> Issue LC</Box></TableCell>
                            <TableCell align="center"><Box fontWeight='fontWeightBold'> Expire LC</Box></TableCell>
                            <TableCell align="center"><Box fontWeight='fontWeightBold'> Action</Box></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.stt} hover onClick={()=>{this.onRowClick(row)}}>
                            <TableCell align="center">{row.stt}</TableCell>
                            <TableCell align="center">{row.id}</TableCell>
                            <TableCell align="center">{row.issue}</TableCell>
                            <TableCell align="center">{row.expr}</TableCell>
                            <TableCell align="center">{row.action}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    </Paper>
                </div>
            )
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
        const progress = <ProgressDialogs
                          tradeID={this.state.currentRow.id}
                          steps={arr}
                          activeStep={this.state.currentRow.action}
                          button={this.state.currentRow.actor === "EXPORTERBANKORG"}
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
                        title={"Total money from Trade In a Year"}
                    />
                </div>
            )
        }

        const renderHome = () => {
            return home()
        }


        const renderAllTrade = () => {
            // console.log("home")
            let tablex = this.state.data;
            for (let i =0 ;i<tablex.length;i ++){
                rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, tablex[i].action))
            }
            return table(rows, "All Trade")
        }

        const renderAction1 = ()=> {
            let tablex = this.state.data;
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "AcceptLC" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, butt))
                    }
                }
                return table(rows, "Trade waiting for AcceptLC")
        }

        const renderAction2 = ()=> {
            let tablex = this.state.data;
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "RequestHalfPayment" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, butt))
                    }
                }
                return table(rows, "Trade waiting for RequestHalfPayment")
        }

        const renderAction3 = ()=> {
            let tablex = this.state.data;
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "PayForCD" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, butt))
                    }
                }
                return table(rows, "Trade waiting for PayForCD")
            
        }
        const renderAction4 = ()=> {
            let tablex = this.state.data;
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "RequestLastPayment" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, butt))
                    }
                }
            return table(rows, "Trade waiting for RequestLastPayment")
            
        }
        const renderAction5 = ()=> {
            console.log("")
            let tablex = this.state.data;
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "PayForPrepaidShippingFee" && tablex[i].actor === "EXPORTERBANKORG" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, butt))
                    }
                }
            return table(rows, "Trade waiting for PayForPrepaidShippingFee")
            
        }
        const renderAction6 = ()=> {
            console.log("")
            let tablex = this.state.data;
            for(let i = 0;i < tablex.length;i++){
                    if(tablex[i].action === "PayForCollectShippingFee" && tablex[i].actor === "EXPORTERBANKORG" ){
                        let butt = <a href="#" onClick={()=> this.actionPopUP(i)} className="bbtn btn-primary btn-sm">{tablex[i].action}</a>
                        rows.push(this.createData(tablex[i].stt+1, tablex[i].id, tablex[i].issueDate, tablex[i].expDate, butt))
                    }
                }
            return table(rows, "Trade waiting for PayForCollectShippingFee")
            
        }
        const renderStatics = () =>{
            let chart1Data = []
            let chart2Data = []
            let tablexTemple =[]
            let t = 1
            let count = 0
            let money = 0
            var today = new Date();
            var yyyy = today.getFullYear();
            if(this.state.data.length !== 0){
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
                    for (let i=0 ; i<tablexTemple.length; i++){
                        let date = tablexTemple[i].date.split("-")
                        if(date[0] == t){
                            count ++
                            if(tablexTemple[i].tradeFee !== undefined){
                                money += parseInt(tablexTemple[i].tradeFee)
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
            case 5:
                return renderAction3();
            case 6:
                return renderAction4();
            case 7:
                return renderAction5();
            case 8:
                return renderAction6();
            }
            
        }
        
        let body = renderPage()
        return(
            <div>
            <Drawer
                logout = {()=>this.props.resetCookies()}
                ta={this.state.data}
                handleNav = {(index)=>{handleNav(index)}} 
                info = {[this.state.user_name,this.state.user_role,this.state]}
                items = {['Home','All Trade','Statics','AcceptLC', 'RequestHalfPayment', 'PayForCD','RequestLastPayment', 'PayForPrepaidShippingFee', 'PayForCollectShippingFee']}
                popUpState={this.state.showPopup}
                progress={progress}
                body ={body}
                org ={'EXPORTERBANKORG'}
                progress ={progress}
                popup ={popup}
                pageIndex={this.state.pageIndex}
                view ={"EXPORTERBANK"}
            />
        </div>
        );

        
    }

}
Exporterbank.propTypes = {
    classes: PropTypes.object.isRequired,
  };
export default withStyles(styles)(Exporterbank);
