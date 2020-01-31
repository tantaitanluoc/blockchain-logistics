import React from 'react';
import axios from 'axios';
import {CustomizedDialogs, InputIssueAndExpDate, Loading} from './custom-form';
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

class IssueLC extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			data: [],
			tradeID:'',
			loading:false,
			issueDate: '',
			expDate:'',
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
		this.setState({data:this.props.lc})
	}
	async fetchData(){
		let params = {
			args: ['LC'],
		};
		let token = cookies.get('user_token');
		let config = {
			headers:{
				'Authorization': `Bearer ${token}`
			}
		}
		axios.post(Const.Server.list,params, config)
		.then(data =>{
			this.setState({data:data.data});
		})
		.catch(err =>{
			this.setState({
				error_dialog:{
					msgboxTitle: 'Failed to connect to server',
					msgboxMessage: `${err.response.data}`,
					msgbox: true,
					errorDialog: true
				}
			});
		})
	}

	handleClick(status) {
		this.setState({tradeID:status, dialog_open: true});
	};

	handleCloseDialog(){
		this.setState({dialog_open: false});
	}

	async handleSubmit(dates){
		this.setState({
			dialog_open: false,
			issueDate: Const.formatDate(dates.issueDate),
			expDate: Const.formatDate(dates.expDate),
			loading:true,
		});
    	await Const.sleep(500);

		let params = {
			args:[
				this.state.tradeID,
				this.state.issueDate,
				this.state.expDate
			],
			ccversion: Const.Chaincode.version
		}
		
		let token = cookies.get('user_token');
		let config = {
			headers:{
				Authorization: `Bearer ${token}`
			}
		}

		axios.post(Const.Server.issue_lc, params, config)
		.then(()=>{
			this.setState({
				error_dialog:{
					msgboxTitle: 'Success',
					msgboxMessage: `Successfully issue L/C for trade ${this.state.tradeID}`,
					msgbox: true,
					errorDialog: false,
				},
				loading: false,
			});
		})
		.catch(err =>{
			this.setState({
				error_dialog:{
					msgboxTitle: 'Failed to issue L/C',
					msgboxMessage: `Server response with an error: ${err.response.data.message}`,
					msgbox: true,
					errorDialog: true
				},
				loading: false,
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
				{obj.status==='REQUESTED'?(<a href='#' onClick={(e)=>{this.handleClick(obj.id)}}>Issue</a>):'-'}
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
    	Issue Letter of Credit
    	</Typography>
    	<Paper className={classes.root}>
    	<Table stickyHeader className={classes.table} aria-label="simple table">
    	<TableHead>
    	<TableRow>
    	<TableCell><Box fontWeight='fontWeightBold'>No.</Box></TableCell>
    	<TableCell align="right"><Box fontWeight='fontWeightBold'>L/C ID.</Box></TableCell>
    	<TableCell align="right"><Box fontWeight='fontWeightBold'>Issue LC</Box></TableCell>
    	</TableRow>
    	</TableHead>
    	<TableBody>
    	{this.state.data? this.renderData():null}
    	</TableBody>
    	</Table>
    	</Paper>
    	<InputIssueAndExpDate 
	    	dialog_title = {`Issue L/C for trade ${this.state.tradeID}`}
	    	content_text = 'Please specify issue date and expire date for L/C.'
	    	open={this.state.dialog_open} 
	    	tradeID={this.state.tradeID}
	    	handleClose = {()=>this.handleCloseDialog()} 
	    	handleSubmit = {dates => this.handleSubmit(dates)}
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


IssueLC.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(IssueLC);