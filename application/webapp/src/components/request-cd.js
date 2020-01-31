import React from 'react';
import {InputForm} from './custom-form';
import axios from 'axios';
import {CustomizedDialogs, Loading, InputForRequestCD} from './custom-form';
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

class RequestCD extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data: [],
            tradeID:'',
            loading: false,
            input_dialog:{
                open: false,
                dlgTitle: '',
                dlgMessage: [],
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
    

    handleClick(status) {
        this.setState({
            tradeID:status, 
            input_dialog:{
                open: true,
                dlgTitle: 'Request C/D',
                dlgMessage: 'Please specify some information to request CD',
            }
        });
    };

    handleCloseInput(){
        this.setState({
            ...this.state,
            input_dialog: {
                open: false,
            },
        });
    }

    async handleSubmitInput(state){
        this.setState({loading:true})
        await Const.sleep(300);
        let args = [
            this.state.tradeID,
            Const.formatDate(state.issueDate),
            state.typeOfPaper,
            state.reasonOfTrade,
            state.sourcePort
        ]
        let params = {
          args: args,
          ccversion: `${Const.Chaincode.version}`,
        }
        let token = cookies.get('user_token');
        let config = {
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
        axios.post(Const.Server.request_cd, params, config)
        .then(()=>{
            this.setState({
                error_dialog:{
                    msgbox: true,
                    loading:false,
                    msgboxTitle: 'Success',
                    msgboxMessage: `Custom declaration for trade ${this.state.tradeID} successfully requested.`,
                    errorDialog: false
                }
            })
        })
        .catch(err =>{
            this.setState({
                error_dialog:{
                    msgbox: true,
                    msgboxTitle: 'Failed to request CD',
                    msgboxMessage: `Error: ${err.response.data.message}`,
                    errorDialog: true
                }
            })            
        })
    }
    renderData() {
        return this.state.data.map((obj,index) => (
            <TableRow key={obj.id} hover>
            <TableCell component="th" scope="row">
            {index+1}
            </TableCell>
            <TableCell align="right">{obj.id}</TableCell>
            <TableCell align="right">{obj.status}</TableCell>
            <TableCell align="right">
                {obj.latestStep==='PrepareShipment'?(<a href='#' onClick={(e)=>{this.handleClick(obj.id)}}>Make a request</a>):'-'}
            </TableCell>
            </TableRow>
            ));
    };

    onCloseDialogs() {
        this.setState({
            error_dialog: {msgbox: false,loading:false,}
        });
        window.location.reload();
        
    }
    render(){
    const classes = this.props;
    return (
        <div style={{ padding: 16, margin: 'auto'}}>
        <Loading open = {this.state.loading} />
        <Typography variant="h4" align="center" component="h1" gutterBottom>
        Request Custom Declaration
        </Typography>
        <Paper className={classes.root}>
        <Table stickyHeader className={classes.table} aria-label="simple table">
        <TableHead>
        <TableRow>
        <TableCell><Box fontWeight='fontWeightBold'>No.</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Trade ID.</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>TA status</Box></TableCell>
        <TableCell align="right"><Box fontWeight='fontWeightBold'>Request C/D</Box></TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {this.state.data? this.renderData():null}
        </TableBody>
        </Table>
        </Paper>
        <InputForRequestCD
            open = {this.state.input_dialog.open}
            dialog_title = {this.state.input_dialog.dlgTitle}
            content_text = {this.state.input_dialog.dlgMessage}
            handleClose = {() => this.handleCloseInput()}
            handleSubmit = {(state) => this.handleSubmitInput(state)}
        />
        <CustomizedDialogs
            error = {this.state.error_dialog.errorDialog}
            dialog_title = {this.state.error_dialog.msgboxTitle}
            dialog_message = {this.state.error_dialog.msgboxMessage}
            open = {this.state.error_dialog.msgbox}
            handleClose = {()=> {this.onCloseDialogs()}}
        />
        </div>
    );
    }
    
}


RequestCD.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(RequestCD);