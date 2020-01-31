import React from 'react';
import axios from 'axios';
import { CustomizedDialogs, ConfirmDialog, Loading } from './custom-form';
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

import * as Const from './const';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
  tr:{
    '&:hover': {
        background: '#f00'
    }
  }
});

class Prepaid extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data: [],
            bl: [],
            tradeID:'',
            loading: false,
            dialog_open: false,
            error_dialog:{
                msgbox: false,
                msgboxTitle: '',
                msgboxMessage: '',
                errorDialog: false
            },
            confirm_dialog:{
                open: false,
                dlgTitle: '',
                dlgMessage: [],
            }
        }
        this.handleClick = this.handleClick.bind(this);
    }
    renderNeed(){
        let TA = this.state.data
        let BL = this.state.bl
        for(let i = 0;i < TA.length;i++){
            let note, fee
            let actor = ""
            let payer = ""
            payer = TA[i].payForShipment
            for(let j = 0;j < BL.length;j++){
                if(BL[j].id === TA[i].id) {
                    note = BL[j].note
                    fee = BL[j].fee
                }
            }
            // console.log(TA[i].latestStep, note)
            payer = payer.toUpperCase()
            if(TA[i].latestStep === "AcceptShipmentAndIssueBL" && note === "PREPAID"){
                if(payer === "IMPORTER" || payer === "IMPORTERORG" || payer === "IMPORTERBANK"){
                    actor = "IMPORTERBANKORG"
                }
            }
            TA[i].actor=actor
            TA[i].fee=fee 
            // console.log(tablex)  
        }
        this.setState({data:TA})
    }
    componentDidMount(){
        this.setState({data:this.props.ta, bl:this.props.bl}, ()=>{this.renderNeed()})
    }

    // async fetchData(){
    //     this.setState({
    //         ...this.state,
    //         loading: true,
    //     });

    //     let params = {
    //         args: ['TA'],
    //     };
    //     let token = cookies.get('user_token');
    //     let config = {
    //         headers:{
    //             'Authorization': `Bearer ${token}`
    //         }
    //     }
    //     axios.post(Const.Server.list,params, config)
    //     .then(data =>{
    //         this.setState({
    //             loading: false,
    //             data: data.data,
    //         });
    //     })
    //     .catch(err =>{
    //         this.setState({
    //             loading: false,
    //             error_dialog:{
    //                 msgboxTitle: 'Failed to connect to server',
    //                 msgboxMessage: `${err.response.data.message}`,
    //                 msgbox: true,
    //                 errorDialog: true
    //             }
    //         });
    //     })
    // }

    handleClick(status) {
        this.setState({tradeID:status, dialog_open: true});
    };

    handleCloseDialog(){
        this.setState({dialog_open: false});
    }
    onCloseDialogs() {
        this.setState({
            error_dialog: {msgbox: false}
        });
    };
    handleCloseConfirmDialog(){
        this.setState({
            confirm_dialog: {
                open: false,
            }
        });
    }
    handleSubmitConfirmDialog(){
        this.setState({
            ...this.state,
            loading:true,
        });

        let params = {
            args:[
                this.state.tradeID,
            ],
            ccversion: Const.Chaincode.version
        }
        
        let token = cookies.get('user_token');
        let config = {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }

        axios.post(Const.Server.prepaid, params, config)
        .then(()=>{
            this.setState({
                loading: false,
                confirm_dialog:{
                    open:false,
                },
                error_dialog:{
                    msgboxTitle: 'Success',
                    msgboxMessage: `Successfully make payment for shipment of trade ${params.args[0]}`,
                    msgbox: true,
                    errorDialog: false
                }
            });
        })
        .catch(err =>{
            let errorMsg = (err.response.data.message !== undefined)?err.response.data.message:'Unknown error.';
            this.setState({
                loading: false,
                confirm_dialog:{
                    open:false,
                },
                error_dialog:{
                    msgboxTitle: 'Failed to make payment',
                    msgboxMessage: `Server response with error: ${errorMsg}`,
                    msgbox: true,
                    errorDialog: true
                }
            });    
        })

    }
    makePrepaid(obj){
        console.log(obj)
        let tradeID = obj.id;
        let total = (obj.fee) - obj.paid;
        this.setState({
            ...this.state,
            tradeID: tradeID,
            confirm_dialog:{
                open: true,
                dlgTitle: 'Payment for shipment confirmation',
                dlgMessage: [`Are you sure to pay for shipment of trade '${tradeID}'?`,`
                This action CANNOT be reversed.`,`
                Total costs: ${total} ${obj.currency}`]
            }
        })   
    }
    renderData() {
        // console.log(this.state.data)
        return this.state.data.map((obj,index) => (
            <TableRow key={obj.id} hover>
            <TableCell component="th" scope="row">
            {obj.id}
            </TableCell>
            <TableCell align="right">{obj.descriptionofGoods}</TableCell>
            <TableCell align="right">{obj.amount}</TableCell>
            <TableCell align="right">{obj.price}</TableCell>
            <TableCell align="right">{obj.currency}</TableCell>
            <TableCell align="right">{obj.paid}</TableCell>
            <TableCell align="right">
            {obj.actor === "IMPORTERBANKORG"?
                <a href="#" onClick = {() => this.makePrepaid(obj)} className="bbtn btn-primary btn-sm">Pay Prepaid Fee</a>
                :
                "-"
            }
            </TableCell>
            </TableRow>
            ));
    };
    render(){
        // console.log(this.state.data)
    const classes = this.props;
    return (
        <div>
        {this.state.loading ?
            <Loading open = {this.state.loading} />
            :
        <div style={{ padding: 16, margin: 'auto'}}>
        <Typography variant="h4" align="center" component="h1" gutterBottom>
        Prepaid Shipment Fee
        </Typography>
        <Paper className={classes.root}>
        <Table stickyHeader className={classes.table} aria-label="simple table">
        <TableHead>
        <TableRow>
        <TableCell><Box fontWeight='fontWeightBold'>Trade ID</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'> Descriptions of Goods</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Amount</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Price</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Currency</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Paid</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Action</Box></TableCell>

        </TableRow>
        </TableHead>
        <TableBody>
        {this.state.data? this.renderData():null}
        </TableBody>
        </Table>
        </Paper>
        <CustomizedDialogs
            error = {this.state.error_dialog.errorDialog}
            dialog_title = {this.state.error_dialog.msgboxTitle}
            dialog_message = {this.state.error_dialog.msgboxMessage}
            open = {this.state.error_dialog.msgbox}
            handleClose = {()=> {this.onCloseDialogs()}}
        />
        <ConfirmDialog
            open = {this.state.confirm_dialog.open}
            dlgTitle = {this.state.confirm_dialog.dlgTitle}
            dlgMessage = {this.state.confirm_dialog.dlgMessage}
            handleClose = {() => this.handleCloseConfirmDialog()}
            handleSubmit = {() => this.handleSubmitConfirmDialog()}
        />
        </div>
        }
        </div>

    );
    }
    
}


Prepaid.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(Prepaid);