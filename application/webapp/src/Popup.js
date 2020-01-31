import React from 'react';
import Axios from  'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Grid} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import FormLabel from '@material-ui/core/FormLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {CustomizedDialogs, Loading} from './components/custom-form';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

class Popup extends React.Component {  

    constructor(props){
        super(props)
        this.token = this.props.token
        this.data = this.props.DataPopup
        this.action = this.props.action
        this.send = this.send.bind(this)
        this.state ={
          date1:new Date('08-18-2019'),
          date2:new Date('08-19-2019'),
          popop:false,
          note:"",
          fee:0,
          discription:"",
          location:"",
          portCount:1,
          portArray:[],
          portArraytemp:[],
          error:"",
          loading:false
        }
    }

    convertDate(inputDate){
      let date = new Date(inputDate);
      return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + date.getFullYear();
    }
    async setLoading(){
      return this.setState({loading:!this.state.loading})
    }

    send(fcn,json, caller){
        // this.props.closePopup()
        this.setLoading()
        let url = '../invoke/'+fcn
        let args
        let date1, date2
        if(json.date1 !== undefined){
          date1 =this.convertDate(json.date1)
        }
        if(json.date2 !== undefined){
          date2 =this.convertDate(json.date2)
        }
        if(fcn === "acceptShipmentAndIssueBL"){
            args = [this.data.id,date1,date2,json.description,json.shipFee,json.note]
            for(let i = 0;i<json.portArray.length;i++){
              args.push(json.portArray[i])
            }
            console.log(args)
        }
        else if(fcn === "requestCollectShippingFee"){
            args = [this.data.id] 
            // console.log(args)
        }
        else if(fcn === "payForCustomsDeclaration"){
            args = [this.data.id] 
            console.log(args)
        }
        else if(fcn === "acceptLC"){
            args = [this.data.id]
            console.log(args)
        }
        else if(fcn === "requestPayment"){
            args = [this.data.id]
            console.log(args)
        }
        else if(fcn === "updateShipmentLocation") {
            args = [this.data.id,json.place]
            console.log(args)
        }
        else if(fcn === "acceptCustomsDeclaration") {
            args = [this.data.id,json.fee]
            console.log(args)
        }
        else if(fcn === "issueEL"){
            args = [this.data.id, date2]
            console.log(args)
        }
        else if(fcn === "payForPreShippingFee"){
            args =[this.data.id]
            console.log(args)
        }
        else if(fcn === "payForCollectShippingFee"){
          args =[this.data.id]
          console.log(args)
        }
        else if(fcn === "requestCollectShippingFee"){
          args =[this.data.id]
          console.log(args)
        }
      
        console.log(this.data.id)
        Axios.post(url,
            {ccversion:'v0' ,args:args},
            {headers: {'Accept': 'application/json',  'Authorization':`Bearer ${this.token}`}},
            ).then(function(res){
                if(res.status === 200) {
                  caller.setLoading().then(()=>{caller.props.closePopup();window.location.reload();})
                }
            })
            .catch((err)=>{
              caller.setLoading().then(()=>alert(err))
            })
    }



  render() {
    console.log(this.state.loading)
    if(this.state.loading === true) {
      return <Loading open={this.state.loading} />
    }
    else{
      let fee
    let date1 = this.state.date1
    let date2 = this.state.date2
    let note = this.state.note
    const handleClose = () => {
      this.setState({popup:true})
    };
  
    const handleOpen = () => {
      this.setState({popup:false})
    };

    if(this.state.error !== ""){
      return(
        <CustomizedDialogs
          open = {true}
          handleClose = {() => this.props.closePopup()}
          dialog_title = {"Server Respone Error"}
          dialog_message = {this.state.error}
          error = {true}
        />
      )
    }

    if(this.props.action === "RequestHalfPayment"){ 
        return(
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Request Payment Form</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Status: First Pay
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("requestPayment",{}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }

    if(this.props.action === "RequestLastPayment"){
        return (
            <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Request Payment Form</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Status: Final Pay
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("requestPayment",{}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
        
    }

    if(this.props.action === "RequestCollectShippingFee"){
      return (
          <div>
          <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Request Collect Shipping Fee</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Trade ID: {this.data.id}<br></br>
                Status: Final Pay
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>{this.props.closePopup()}} color="primary">
                Cancel
              </Button>
              <Button onClick={()=>this.send("requestCollectShippingFee",{}, this)} color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )
      
  }
    

    if(this.props.action === "AcceptLC"){
        return(
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Accept Letter of Credit</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Issue date: {this.data.issueDate}<br></br>
                  Expire date:{this.data.expDate}<br></br>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("acceptLC",{}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }

    if(this.props.action === "PayForCD"){
        return(
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Pay For Customs Declaration</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Fee: {this.data.cdFee} $
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("payForCustomsDeclaration",{}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }


    if(this.props.action === "IssueEL"){
        return(
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title"> Issue Export License </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Goods :{this.data.goods}<br></br>
                </DialogContentText>
                <FormLabel component="legend">Expire Date</FormLabel>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container justify="space-around">
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MM-dd-yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    value={date2}
                    onChange={(date)=> this.setState({date2:date})}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("issueEL", {date2:date2}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }

    if(this.props.action === "AcceptCD"){
        return (
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Accept Custom Declaration</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Goods: {this.data.goods}<br></br>
                  Export License status: {this.data.elstatus}<br></br>
                  Destination Port: {this.data.placeShipment}<br></br>
                </DialogContentText>
                <TextField
                  autoFocus
                  onChange={(event)=> fee = event.target.value}
                  margin="dense"
                  label="Fee of Shipping"
                  type="number"
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("acceptCustomsDeclaration", {fee:fee}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }

    if(this.props.action === "UpdateShipmentLocation"){
        return (
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Update Shipment Location</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Current Location: {this.data.location}<br></br>
                </DialogContentText>
                <FormLabel component="legend">New Location</FormLabel>
                <Select
                  open={this.state.popup}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  value={this.state.location}
                  onChange={(event)=>this.setState({location:event.target.value})}
                >
                  {this.data.listPort.map(location => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("updateShipmentLocation", {place:this.state.location}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }

    if(this.props.action === "PayForPrepaidShippingFee"){
      return (
        <div>
          <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Pay For Prepaid Shipping Fee</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Trade ID: {this.data.id}<br></br>
                Fee of Shipment: {this.data.shipFee}<br></br>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>{this.props.closePopup()}} color="primary">
                Cancel
              </Button>
              <Button onClick={()=>this.send("payForPreShippingFee", {}, this)} color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )
  }

  if(this.props.action === "PayForCollectShippingFee"){
    return (
      <div>
        <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Pay For Collect Shipping Fee</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Trade ID: {this.data.id}<br></br>
              Fee of Shipment: {this.data.shipFee}<br></br>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>{this.props.closePopup()}} color="primary">
              Cancel
            </Button>
            <Button onClick={()=>this.send("payForCollectShippingFee", {}, this)} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
}
    
    if(this.props.action === "AcceptShipmentAndIssueBL"){
      let portArray = this.state.portArray
        return (
          <div>
            <Dialog open={true} onClose={()=>{this.props.closePopup()}} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Accept Shipment And Issue BL</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Trade ID: {this.data.id}<br></br>
                  Goods: {this.data.goods}<br></br>
                  Amounts: {this.data.amount}<br></br>
                  Date of shipment:{this.data.date}<br></br>
                  Destination Port: {this.data.destination}<br></br>
                  Payer:{this.data.payer}<br></br>
                </DialogContentText>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container justify="space-around">
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="MM-dd-yyyy"
                      margin="normal"
                      id="date-picker-inline"
                      value={this.state.date1}
                      onChange={(date)=> this.setState({date1:date})}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  </Grid>
                </MuiPickersUtilsProvider>
                <FormLabel component="legend">Expire Date</FormLabel>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container justify="space-around">
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MM-dd-yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    value={date2}
                    onChange={(date)=> this.setState({date2:date})}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              <br></br>
              <FormLabel component="legend">Type of Payment</FormLabel>
              <Select
                  open={this.state.popup}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  value={note}
                  onChange={(event)=>this.setState({note:event.target.value})}
                >
                  <MenuItem value={"PREPAID"}>PREPAID</MenuItem>
                  <MenuItem value={"TOCOLLECT"}>COLLECT</MenuItem>
                </Select>
                <TextField
                  autoFocus
                  onChange={(event)=> this.setState({description: event.target.value})}
                  margin="dense"
                  label="Descriptions of carrier"
                  type="text"
                  fullWidth
                  required
                />
                <TextField
                  autoFocus
                  onChange={(event)=> this.setState({fee:event.target.value})}
                  margin="dense"
                  label="Fee of Shipping"
                  type="number"
                  fullWidth
                  required
                />
                <FormLabel component="legend">Port On Transport</FormLabel>
                <TextField
                  autoFocus
                  onChange={(event)=> this.setState({portCount:event.target.value},()=>{
                    let arr = [];
                    for(let i=0;i<this.state.portCount;i++){
                      arr.push("")
                    }
                    this.setState({portArraytemp:arr})
                  })}
                  margin="dense"
                  label="portNumber"
                  type="number"
                  
                />
                {this.state.portArraytemp.map((_,index) => (
                  <div key={index}>
                    <br></br>
                  <FormLabel component="legend">Middle Port {index + 1} </FormLabel>
                    <TextField
                    autoFocus
                    onChange={(event)=> {
                      portArray[index]=event.target.value
                      this.setState({portArray:portArray})
                    }}
                    margin="dense"
                    type="text"
                    fullWidth
                    required
                  />
                  </div>
                  ))
                }
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.props.closePopup()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>this.send("acceptShipmentAndIssueBL", {shipFee:this.state.fee,description:this.state.description,date1:date1,date2:date2, note:note, portArray:this.state.portArray}, this)} color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )
    }
    
  }
    

    }  
}  

export default Popup;