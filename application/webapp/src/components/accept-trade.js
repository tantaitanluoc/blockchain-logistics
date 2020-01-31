import React from 'react';
import axios from 'axios';
import {CustomizedDialogs, Loading, InputForAcceptTrade} from './custom-form';
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
  }
});

class AcceptTrade extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data: [],
            tradeID:'',
            loading: false,
            confirm_dialog:{
                open: false,
                dlgTitle: '',
                dlgMessage: '',
            },
            error_dialog:{
                msgbox: false,
                msgboxTitle: '',
                msgboxMessage: '',
                errorDialog: false
            }
        }
        this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount(){
        this.setState({data:this.props.ta})
    }
   
    renderData() {
        return this.state.data.map((obj,index) => (
            <TableRow key={obj.id}>
            <TableCell component="th" scope="row">
            {index+1}
            </TableCell>
            <TableCell align="right">{obj.id}</TableCell>
            <TableCell align="right">
                {obj.status==='REQUESTED'?(<a href='#' onClick={(e)=>{this.handleClick(obj.id)}}>{obj.status}</a>):obj.status}
            </TableCell>
            </TableRow>
            ));
    };


    handleClick(status) {
        this.setState({
            tradeID:status,
            confirm_dialog:{
                open: true,
                dlgTitle: 'Accept Trade Confirmation',
                dlgMessage:`Please specify some required information bellow:`
            },
        });
    };
    handleCloseInputDialog(){
        this.setState({
            ...this.state,
            confirm_dialog:{
                open: false,
            }
        });
    }
    handleSubmitInputDialog(substate){
        this.setState({
            ...this.state,
            loading: true,
        });
        let params = {
            ccversion: Const.Chaincode.version,
            args: [
                this.state.tradeID,
                substate.charges_payer,
                substate.price_per_goods,
                substate.currency
            ],
        };
        let token = cookies.get('user_token');
        let config = {
            headers:{
                'Authorization': `Bearer ${token}`
            }
        }

        axios.post(Const.Server.accept_trade, params, config)
        .then(() => {
            this.setState({
                ...this.state,
                loading: false,
                confirm_dialog:{
                    open: false,
                },
                error_dialog:{
                    msgboxTitle: 'Success',
                    msgboxMessage: `Trade agreement '${this.state.tradeID}' has successfully been accepted'.`,
                    msgbox: true,
                    errorDialog: false
                }
            });
        })
        .catch(err =>{
            this.setState({
                loading: false,
                error_dialog:{
                    msgboxTitle: 'Failed to accept trade',
                    msgboxMessage: `Server response with an error: ${err.response.data.message}`,
                    msgbox: true,
                    errorDialog: true
                }
            });             
        })

}
    handleCloseCustomizedDialogs() {
        this.setState({
            error_dialog: {msgbox: false}
        });
        window.location.reload();
    }

    render(){
    const classes = this.props;
    return (
        <div>
			{this.state.loading ?
				<Loading open = {this.state.loading} />
				:
            <div style={{ padding: 16, margin: 'auto'}}>
            <Typography variant="h4" align="center" component="h1" gutterBottom>
            Accept Trades
            </Typography>
            <Paper className={classes.root}>
            <Table stickyHeader className={classes.table} aria-label="simple table">
            <TableHead>
            <TableRow>
            <TableCell><Box fontWeight='fontWeightBold'>No.</Box></TableCell>
            <TableCell align="right"><Box fontWeight='fontWeightBold'>Trade ID.</Box></TableCell>
            <TableCell align="right"><Box fontWeight='fontWeightBold'>Status</Box></TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {this.state.data? this.renderData():null}
            </TableBody>
            </Table>
            </Paper>
            <InputForAcceptTrade
                open = {this.state.confirm_dialog.open}
                tradeID = {this.state.tradeID}
                content_text = {this.state.confirm_dialog.dlgMessage}
                handleClose = {() => this.handleCloseInputDialog()}
                handleSubmit = {(substate) => this.handleSubmitInputDialog(substate)}
            />
            <CustomizedDialogs
                error = {this.state.error_dialog.errorDialog}
                dialog_title = {this.state.error_dialog.msgboxTitle}
                dialog_message = {this.state.error_dialog.msgboxMessage}
                open = {this.state.error_dialog.msgbox}
                handleClose = {()=> {this.handleCloseCustomizedDialogs()}}
            />
            </div>
            }
        </div>
        );
    }
    
}


AcceptTrade.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(AcceptTrade);