import React from 'react';
import { Field, Form } from 'react-final-form';
import { TextField, Select } from 'final-form-material-ui';
import {
  Typography, CssBaseline, Paper, Grid, Button, MenuItem
} from '@material-ui/core';
// Picker
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import axios from 'axios';
import {CustomizedDialogs, DatePickerWrapper, Loading} from './custom-form';

import * as Const from './const';
import Cookies from 'universal-cookie';

const cookies = new Cookies();



const validate = values => {
  const errors = {};

  const requiredFields = [
  'tradeID',
  'amountOfGoods',
  'descriptionsOfGoods',
  'placeToShipment',
  'issueDate',
  'timeToComplete'
  ]

  requiredFields.forEach(field =>{
    if(!values[field])
      errors[field] = 'Required';
  });

  if(!/^[A-Za-z0-9-_]+$/.test(values.tradeID)) errors.tradeID = 'ID chứa kí tự không hợp lệ';

  if (!/^[0-9]+$/.test(values.amountOfGoods))  errors.amountOfGoods = 'Vui lòng nhập một số';

  return errors;
};

function RequestTrade() {
  const [loading, setLoading] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState(false);
  const [msgboxTitle, setMsgboxTitle] = React.useState('');
  const [msgboxMessage, setMsgboxMessage] = React.useState('');
  const [list_ports] = React.useState(Const.Chaincode.list_ports);

  const onSubmit = async (values, form) => {
    setLoading(true);

    await Const.sleep(500);

    values.issueDate  = Const.formatDate(values.issueDate);
    values.timeToComplete = Const.formatDate(values.timeToComplete);


    let args = [
      values.tradeID,
      values.issueDate,
      values.descriptionsOfGoods,
      values.amountOfGoods,
      values.timeToComplete,
      values.placeToShipment
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
    
    axios.post(Const.Server.request_trade, params, config)
    .then(()=>{
      setMsgboxTitle('Success');
      setMsgboxMessage(`Trade '${values.tradeID}' is successfully requested.`);
      setErrorDialog(false);
      setMsgbox(true);
      setLoading(false);
      form.reset();
    })
    .catch(err=>{
      console.log(err);
      setMsgboxTitle('Failed to request trade');
      setMsgboxMessage(`Request for trade '${values.tradeID}' failed with error: ${err.response.data.message}.`);
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false);
      form.reset();
    })
  };

  const onCloseDialogs = () =>{
    setMsgbox(false);
    window.location.reload();
  }

  return (
    <div>
			{loading ?
				<Loading open = {loading} />
				:
        <div style={{ padding: 16, margin: 'auto', maxWidth: 600 }}>
        <CssBaseline />
        <Typography variant="h4" align="center" component="h1" gutterBottom>
        Request Trade
        </Typography>
        <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit, pristine, form, reset, submitting, values }) => (
          <form onSubmit={handleSubmit} noValidate>
          <Paper style={{ padding: 16 }}>
          <Grid container alignItems="flex-start" spacing={2}>
          <Grid item xs={12}>
          <Field
          fullWidth
          required
          name="tradeID"
          component={TextField}
          type="text"
          label="Trade ID"
          />
          </Grid>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid item xs={6}>
          <Field
          name="issueDate"
          component={DatePickerWrapper}
          fullWidth
          margin="normal"
          label="Date of issurance"
          />
          </Grid>
          </MuiPickersUtilsProvider>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid item xs={6}>
          <Field
          name="timeToComplete"
          component={DatePickerWrapper}
          fullWidth
          margin="normal"
          label="Time of completed shipment"
          />
          </Grid>
          </MuiPickersUtilsProvider>
          <Grid item xs={12}>
          <Field
          name="descriptionsOfGoods"
          fullWidth
          required
          component={TextField}
          multiline
          label="Descriptions of Goods"
          />
          </Grid>
          <Grid item xs={12}>
          <Field
          fullWidth
          required
          name="amountOfGoods"
          component={TextField}
          type="text"
          label="Amount of Goods"
          />
          </Grid>
          <Grid item xs={12}>
          <Field
          fullWidth
          required
          name="placeToShipment"
          component={Select}
          label="Place to Shipment"
          formControlProps={{ fullWidth: true }}
          >
          {
            list_ports.map(port =>(
                <MenuItem 
                  key = {Object.keys(port)[0]} 
                  value = {Object.keys(port)[0]}
                >
                  {port[Object.keys(port)[0]]}
                </MenuItem>
            ))
          }
          </Field>
          </Grid>
          <Grid item style={{ marginTop: 16 }}>
          <Button
          type="button"
          variant="contained"
          onClick={form.reset}
          disabled={submitting || pristine || loading}
          >
          Reset
          </Button>
          </Grid>
          <Grid item style={{ marginTop: 16 }}>
          <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={submitting || pristine || loading}
          >
          Submit
          </Button>
          </Grid>
          </Grid>
          </Paper>
          </form>
          )}
        />
        <CustomizedDialogs
          error = {errorDialog}
          dialog_title = {msgboxTitle}
          dialog_message = {msgboxMessage}
          open = {msgbox}
          handleClose = {()=> {onCloseDialogs()}}
        />
        </div>
      }
    </div>
    );
}



export default RequestTrade;
