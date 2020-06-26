import React from 'react';
import {ConfirmDialog} from './custom-form';
import axios from 'axios';
import {CustomizedDialogs, Loading} from './custom-form';
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

class RequestLC extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			data: [],
			tradeID:'',
			documents: '',
			loading: false,
			dialog_open: false,
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
		this.setState({tradeID:status, dialog_open: true});
	};

	handleCloseDialog(){
		this.setState({dialog_open: false});
	}

	getDocs(evt) {
		this.setState({documents:evt.target.value});
	}

	handleSubmit(documents){
		this.setState({
			loading: true,
			dialog_open: false
		});

		let params = {
			args:[
				this.state.tradeID,
			],
			ccversion: `${Const.Chaincode.verison}`,
		}
		let token = cookies.get('user_token');
		let config = {
			headers:{
				Authorization: `Bearer ${token}`
			}
		}

		axios.post(Const.Server.request_lc, params, config)
		.then(()=>{
			this.setState({
				loading: false,
				error_dialog:{
					msgboxTitle: 'Success',
					msgboxMessage: `Successfully request L/C for trade ${this.state.tradeID}`,
					msgbox: true,
					errorDialog: false
				}
			});
		})
		.catch(err =>{
			this.setState({
				loading: false,
				error_dialog:{
					msgboxTitle: 'Failed to request L/C',
					msgboxMessage: `Server response with an error: ${err.response.data.message}`,
					msgbox: true,
					errorDialog: true
				}
			});			
		})
	}
	renderData() {
		return this.state.data.map((obj,index) => (
			<TableRow key={obj.id}>
			<TableCell component="th" scope="row">
			{index+1}
			</TableCell>
			<TableCell align="right">{obj.id}</TableCell>
			<TableCell align="right">
				{obj.latestStep==='AcceptTrade'?(<a href='#' onClick={(e)=>{this.handleClick(obj.id)}}>Make a request</a>):'-'}
			</TableCell>
			</TableRow>
			));
	};

	onCloseDialogs() {
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
					Request Letter of Credit
					</Typography>
					<Paper className={classes.root}>
					<Table stickyHeader className={classes.table} aria-label="simple table">
					<TableHead>
					<TableRow>
					<TableCell><Box fontWeight='fontWeightBold'>No.</Box></TableCell>
					<TableCell align="right"><Box fontWeight='fontWeightBold'>Trade ID.</Box></TableCell>
					<TableCell align="right"><Box fontWeight='fontWeightBold'>Request LC</Box></TableCell>
					</TableRow>
					</TableHead>
					<TableBody>
					{this.state.data? this.renderData():null}
					</TableBody>
					</Table>
					</Paper>
					<ConfirmDialog 
						dlgTitle = {`Request L/C for trade ${this.state.tradeID}`}
						dlgMessage={['Send your request to Importer Bank']}
						open={this.state.dialog_open} 
						tradeID={this.state.tradeID}
						handleClose = {()=>this.handleCloseDialog()} 
						handleSubmit = {()=> this.handleSubmit()}
						getDocs = {(evt)=> this.getDocs(evt)}
					/>
					<CustomizedDialogs
						error = {this.state.error_dialog.errorDialog}
						dialog_title = {this.state.error_dialog.msgboxTitle}
						dialog_message = {this.state.error_dialog.msgboxMessage}
						open = {this.state.error_dialog.msgbox}
						handleClose = {()=> {this.onCloseDialogs()}}
					/>
				</div>
			}
		</div>
    	
    	
	);
	}
	
}


RequestLC.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(RequestLC);