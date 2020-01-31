import React from 'react';
import { Form } from 'react-final-form';
import { Field } from 'react-final-form-html5-validation';
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
import {CustomizedDialogs, Loading, ScrollDialog} from './custom-form';

import * as Const from './const';
import Cookies from 'universal-cookie';

const cookies = new Cookies();



const validate = values => {
  // await Const.sleep(500)
  const errors = {};

  const requiredFields = [
  'imp',
  'imp_bank',
  'imp_bank_bal',
  'exp',
  'exp_bank',
  'exp_bank_bal',
  'car',
  'car_bal',
  'reg',
  'reg_bal'
  ]
  requiredFields.forEach(field =>{
    if(!values[field])
      errors[field] = 'Required';
    if(!/^[A-Za-z0-9]+$/.test(values[field]))
      errors[field] = 'Invalid character';
  });

  if(!/^[0-9]+$/.test(values.imp_bank_bal)) errors.imp_bank_bal = 'Account balance must be a number';
  if(!/^[0-9]+$/.test(values.exp_bank_bal)) errors.exp_bank_bal = 'Account balance must be a number';
  if(!/^[0-9]+$/.test(values.car_bal)) errors.car_bal = 'Account balance must be a number';
  if(!/^[0-9]+$/.test(values.reg_bal)) errors.reg_bal = 'Account balance must be a number';

  return errors;
};

function CreateLogisticsApp() {
  const [loading, setLoading] = React.useState(false);
  const [loadingMsg, setLoadingMsg] = React.useState(null);
  const [msgbox, setMsgbox] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState(false);
  const [msgboxTitle, setMsgboxTitle] = React.useState('');
  const [msgboxMessage, setMsgboxMessage] = React.useState('');

  const getError = errs =>{
    try{
      let a = errs.response.data.message;
      return a;
    } catch(err){
      return "Unknown error";
    }
  }
  const onSubmit = async (values, form) => {
    await Const.sleep(500);

    let params = {
    }
    let token = cookies.get('user_token');
    let config = {
      headers:{
        Authorization: `Bearer ${token}`
      }
    }
    try{
      setLoadingMsg('Creating channel...');
      setLoading(true);
      await axios.post(Const.Server.create_channel, params, config);
    } catch(err){
      setMsgboxTitle('Failed to create channel');
      setMsgboxMessage(`Channel creation failed with error: ${getError(err)}.`);
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false);
    }

    try{
      setLoadingMsg('Joining channel...');
      await axios.post(Const.Server.join_channel, params, config);
    } catch(err){
      setMsgboxTitle('Failed to join channel');
      setMsgboxMessage(`Channel connection failed with error: ${getError(err)}`);
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false);
      return;
    }

    try{
      setLoadingMsg('Installing chaincode...');
      params = {
        ccpath: Const.Chaincode.ccpath,
        ccversion: Const.Chaincode.version,
      }
      await axios.post(Const.Server.install_chaincode, params, config);
    } catch(err){
      setMsgboxTitle('Failed to install chaincode');
      setMsgboxMessage(`Chaincode installation failed with error: ${getError(err)}`);
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false); 
      return;
    }

    try{
      setLoadingMsg('Instantiating chaincode...');
      let args = [
      values.imp,
      values.imp_bank,
      values.imp_bank_bal,
      values.exp,
      values.exp_bank,
      values.exp_bank_bal,
      values.car,
      values.car_bal,
      values.reg,
      values.reg_bal
      ];
      params = {
        ...params,
        args: args
      }
      await axios.post(Const.Server.instantiate_chaincode, params, config);
    } catch(err) {
      setMsgboxTitle('Failed to initialize logistics application');
      setMsgboxMessage(`Chaincode instantiation failed with error: ${getError(err)}`);
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false);
      return;
    }

    setMsgboxTitle('Success');
    setMsgboxMessage('Successfully initialize logistics application.');
    setErrorDialog(false);
    setMsgbox(true);
    setLoading(false); 
  };

  const onCloseDialogs = () =>{
    setMsgbox(false);
  }
  return (
    <div style={{ padding: 16, margin: 'auto', maxWidth: 600 }}>
    <CssBaseline />
    <Loading open = {loading} loading_msg={loadingMsg}/>
    <Typography variant="h4" align="center" component="h1" gutterBottom>
    Initialize logistics application
    </Typography>
    <Form
    onSubmit={onSubmit}
    validate={false}
    render={({ handleSubmit, pristine, form, reset, submitting, values }) => (
      <form onSubmit={handleSubmit}>
      <Paper style={{ padding: 16 }}>
      <Grid container alignItems="flex-start" spacing={2}>
      <Grid item xs={12}>
      <Field
      fullWidth
      required
      name="imp"
      component={TextField}
      type="text"
      label="Importer name"
      defaultValue = "LumberInc"
      pattern="[A-Z].+"
      patternMismatch="Capitalize your name!"
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="imp_bank"
      component={TextField}
      type="text"
      label="Importer bank name"
      defaultValue = "ImpBank"
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="imp_bank_bal"
      component={TextField}
      type="text"
      label="Importer bank balance"
      defaultValue = '5000000'
      />
      </Grid>

      <Grid item xs={12}>
      <Field
      fullWidth
      required
      name="exp"
      component={TextField}
      type="text"
      label="Exporter name"
      defaultValue = "WoodenToys"
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="exp_bank"
      component={TextField}
      type="text"
      label="Exporter bank name"
      defaultValue = "ExpBank"
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="exp_bank_bal"
      component={TextField}
      type="text"
      label="Exporter bank balance"
      defaultValue = '5000000'
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="car"
      component={TextField}
      type="text"
      label="Carrier name"
      defaultValue = "UniversalFrieght"
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="car_bal"
      component={TextField}
      type="text"
      label="Carrier balance"
      defaultValue = '0'
      />
      </Grid>

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="reg"
      component={TextField}
      type="text"
      label="Regulator name"
      defaultValue = "ForestryDepartment"
      />
      </Grid>  

      <Grid item xs={6}>
      <Field
      fullWidth
      required
      name="reg_bal"
      component={TextField}
      type="text"
      label="Regulator balance"
      defaultValue = '0'
      />
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
    );
}



export default CreateLogisticsApp;
