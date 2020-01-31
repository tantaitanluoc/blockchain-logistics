import React from 'react';
import axios from 'axios';
import {CustomizedDialogs, ProgressDialogs } from './custom-form';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip'

import * as Const from './const';
import Cookies from 'universal-cookie';
  
const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
});

const cookies = new Cookies();

class GetTradeStatus extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: null,
      msgbox: false,
      msgboxTitle: '',
      msgboxMessage: '',
      errorDialog: false,
      view: false,
      tradeID: '',
      listBL:null,
      trade_process:[],
      selectedTradeSteps: null,
      selectedTradeActiveStep:0,
      ready:false,
    };
  }
  componentDidMount(){
    this.setState({
      data:this.props.ta,
      listBL:this.props.bl,
    },()=>{
      this.processData()
    })
  }

   
  // async processData(){
  //   this.setState({
  //     ...this.state,
  //   });

  //   while(!this.state.data)
  //     await Const.sleep(50);

  //   while(!this.state.listBL)
  //     await Const.sleep(50);
  //     let arr = []
  //     let actor = []

  //   this.state.data.forEach(trade =>{
  //     if(JSON.stringify(trade) === '{}')
  //       return;
  //     let tradeID = trade.id;
  //     let latestStep = trade.latestStep;
  //     let list_steps = {};
  //     let index = 0;
  //     let bl = this.state.listBL.find(bl => bl.id === tradeID);
  //     let type = (bl !== undefined) ? bl.note: '';

  //     if(type === 'PREPAID')
  //       list_steps = Const.Chaincode.list_steps_for_prepaid;
  //     else if(type === 'COLLECT')
  //       list_steps = Const.Chaincode.list_steps_for_to_collect;
  //     else
  //       list_steps = Const.Chaincode.list_initial_steps;

  //     let labels = [];
  //     for(let key in list_steps)
  //       labels.push(list_steps[key].name)
      
  //     if(list_steps[latestStep] !== undefined){
  //       index = list_steps[latestStep].index
  //     }
  //     console.log(actor) 
  //     if(this.state.trade_process[tradeID] === undefined){
  //         let json = {steps:labels,activeStep:index}
  //         arr.push(json)
  //     }
  //   })

  //   this.setState({
  //     ...this.state,
  //     trade_process:arr,
  //     ready: true
  //   })
  // }

  async processData(){
    // this.setState({
    //   ...this.state,
    //   loading:true,
    // });

    while(!this.state.data)
      await Const.sleep(50);

    while(!this.state.listBL)
      await Const.sleep(50);

      console.log('trade')
      console.log(this.state.data)
    this.state.data.forEach(trade =>{
      if(JSON.stringify(trade) === '{}')
        return;
      
      let tradeID = trade.id;
      let latestStep = trade.latestStep;
      let list_steps = {};
      let index = 0;
      let bl = this.state.listBL.find(bl => bl.id === tradeID);
      let type = (bl !== undefined) ? bl.note: '';

      if(type === 'PREPAID')
        list_steps = Const.Chaincode.list_steps_for_prepaid;
      else if(type === 'COLLECT')
        list_steps = Const.Chaincode.list_steps_for_to_collect;
      else
        list_steps = Const.Chaincode.list_initial_steps;

      let labels = [];
      for(let key in list_steps)
        labels.push(list_steps[key].name)

      index = list_steps[latestStep].index;
      
      if(this.state.trade_process[tradeID] === undefined){
        this.setState(prevState =>{
          let trade_process = Object.assign({},prevState.trade_process);
          trade_process[tradeID] = {
            steps:labels,
            activeStep: index
          }
          return {trade_process};
        })
      }
    })
    this.setState({
      ready: true
    })
  }

  onCloseDialogs(){
    this.setState({msgbox: false})
  };

  viewDetail(id){
    let temp = this.state.trade_process[id].steps;
    let index = this.state.trade_process[id].activeStep;
    this.setState({
      tradeID: id,
      view: true,
      selectedTradeActiveStep: index,
      selectedTradeSteps: temp,
    });
  };
  onCloseProgressDialogs(){
    this.setState({view: false})
  };

  getNextStep(tradeID, lastestStep){
    if(this.state.ready){
      if(this.state.trade_process[tradeID]!== undefined)
        return this.state.trade_process[tradeID].steps[this.state.trade_process[tradeID].activeStep+1];
    }
    else return 'Pending...';
  }

  renderData(){
    return this.state.data.map((obj,index) => (
            <TableRow key={obj.id} hover onClick={()=>this.viewDetail(obj.id)}>
              <TableCell component="th" scope="row">
                {obj.id}
              </TableCell>
              <TableCell align="right">{obj.issDate}</TableCell>
              <TableCell align="right">{obj.documents}</TableCell>
              <TableCell align="right">{obj.status}</TableCell>
              <TableCell align="right" alt='View details'>
                {this.getNextStep(obj.id, obj.latestStep)}
              </TableCell>
            </TableRow>
          ));
  };


  render(){
    const classes = this.props;
    return (
      <div style={{ padding: 16, margin: 'auto'}}>
      <Typography variant="h4" align="center" component="h1" gutterBottom>Trades status</Typography>
      <Paper className={classes.root}>
      <Table stickyHeader className={classes.table} aria-label="simple table">
      <TableHead>
      <TableRow>
      <TableCell><Box fontWeight='fontWeightBold'> Trade ID</Box></TableCell>
      <TableCell align="right"><Box fontWeight='fontWeightBold'> Issue Date</Box></TableCell>
      <TableCell align="right"><Box fontWeight='fontWeightBold'> Documents</Box></TableCell>
      <TableCell align="right"><Box fontWeight='fontWeightBold'> Status</Box></TableCell>

      <TableCell align="right"><Box fontWeight='fontWeightBold'> Next Action</Box></TableCell>
      </TableRow>
      </TableHead>
      <TableBody>
      {(this.state.data && this.state.listBL) ?this.renderData():null}
      </TableBody>
      </Table>
      </Paper>
      <CustomizedDialogs
        error = {this.state.errorDialog}
        dialog_title = {this.state.msgboxTitle}
        dialog_message = {this.state.msgboxMessage}
        open = {this.state.msgbox}
        handleClose = {()=> {this.onCloseDialogs()}}
      />
        <ProgressDialogs
          open = {this.state.view}
          tradeID = {this.state.tradeID}
          handleClose = {()=> this.onCloseProgressDialogs()}
          steps = {this.state.selectedTradeSteps}
          activeStep = {this.state.selectedTradeActiveStep+1}
        />
      </div>
      );
  }
}

GetTradeStatus.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(GetTradeStatus);