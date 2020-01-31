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
import {CustomizedDialogs, Loading, ScrollDialog} from './custom-form';

import * as Const from './const';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const orgs = [
    {importerorg: 'Importer'},
    {importerbankorg: 'Importer Bank'},
    {exporterorg: 'Exporter'},
    {exporterbankorg: 'Exporter Bank'},
    {carrierorg: 'Carrier'},
    {regulatororg: 'Regulator'},
    ];
const roles = [
  {manager: "Manager"},
  {accountancy: "Accountant"},
]


const validate = values => {
  const errors = {};

  const requiredFields = [
  'username',
  'orgname',
  'role',
  ]

  requiredFields.forEach(field =>{
    if(!values[field])
      errors[field] = 'Required';
  });

  if(!/^[A-Za-z0-9-_]+$/.test(values.username)) errors.username = 'User name chứa kí tự không hợp lệ';

  return errors;
};

function RegisterUser() {
  const [loading, setLoading] = React.useState(false);
  const [msgbox, setMsgbox] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState(false);
  const [msgboxTitle, setMsgboxTitle] = React.useState('');
  const [msgboxMessage, setMsgboxMessage] = React.useState('');
  const [sdlgOpen, setSdlgOpen] = React.useState(false);
  const [sdlgData, setSdlgData] = React.useState([]);
  const [incrmt, setIncrmt] = React.useState(parseInt(localStorage.getItem('incrmt'))+1||0);

  const onSubmit = async (values, form) => {
    setLoading(true);

    await Const.sleep(500);

    let params = {
      username: values.username,
      orgname: values.orgname,
      role: values.role,
    }
    let token = cookies.get('user_token');
    let config = {
      headers:{
        Authorization: `Bearer ${token}`
      }
    }
    
    axios.post(Const.Server.register, params, config)
    .then((rs)=>{
      setSdlgData([{
        username: params.username,
        orgname: params.orgname,
        role: params.role,
        secret: rs.data.secret,
      }]);
      setSdlgOpen(true);
      setLoading(false);
      form.reset();
    })
    .catch(err=>{ 
      setMsgboxTitle('Failed to register user');
      setMsgboxMessage(`Registration for user '${values.username}' failed.`);
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false);
      form.reset();
    })
  };

  const sendToServer = async (users,config) =>{
    let temp = [];
    let promises = [];
    setSdlgData([]); // xóa thông tin những tài khoản đã đăng kí trước đó
    users.map(user =>{
      let params = {
        username: user.username,
        orgname: user.orgname,
        role: user.role,
      }
      promises.push(axios.post(Const.Server.register,params,config));
    });
    // xử lý bất đồng bộ tất cả request
    return axios.all(promises)
    .then(responses =>{
      responses.forEach(response =>{
        temp = [
          ...temp,
          {
            username: response.data.username,
            orgname: response.data.orgname,
            role: response.data.role,
            secret: response.data.secret,
          }
        ]
      })
      return temp;
    })
    .catch(err =>{
      return null;
    })
  }

  const autoGenerate = async () =>{
    setLoading(true);
    let users = [
      {username: 'impmng'+incrmt, orgname: 'importerorg', role: 'manager'},
      {username: 'impact'+incrmt, orgname: 'importerorg', role: 'accountancy'},
      {username: 'expmng'+incrmt, orgname: 'exporterorg', role: 'manager'},
      {username: 'expact'+incrmt, orgname: 'exporterorg', role: 'accountancy'},
      {username: 'impbankmng'+incrmt, orgname: 'importerbankorg', role: 'manager'},
      {username: 'impbankact'+incrmt, orgname: 'importerbankorg', role: 'accountancy'},
      {username: 'expbankmng'+incrmt, orgname: 'exporterbankorg', role: 'manager'},
      {username: 'expbankact'+incrmt, orgname: 'exporterbankorg', role: 'accountancy'},
      {username: 'carmng'+incrmt, orgname: 'carrierorg', role: 'manager'},
      {username: 'caract'+incrmt, orgname: 'carrierorg', role: 'accountancy'},
      {username: 'regmng'+incrmt, orgname: 'regulatororg', role: 'manager'},
      {username: 'regact'+incrmt, orgname: 'regulatororg', role: 'accountancy'},
    ]

    let token = cookies.get('user_token');
    let config = {
      headers:{
        Authorization: `Bearer ${token}`
      }
    }
    let temp = await sendToServer(users,config)
    if(temp!==null){
      setSdlgData([...sdlgData,...temp]);
      setSdlgOpen(true);
      localStorage.setItem('incrmt',incrmt);
    } else{
      setMsgboxTitle('Failed to register user');
      setMsgboxMessage('Auto generate failed. Please try again');
      setErrorDialog(true);
      setMsgbox(true);
      setLoading(false);
      setIncrmt(incrmt+1);
      localStorage.setItem('incrmt',incrmt+1);
    }
    setLoading(false);
  }

  const onCloseDialogs = () => {
    setMsgbox(false);
  }

  const handleSaveToText = () => {
    const element = document.createElement("a");
    let temp = [];
    try{
      sdlgData.map(data =>{
        temp.push(JSON.stringify(data)+'\n')
      })
    }catch(err){
     setMsgboxTitle('Failed to download');
     setMsgboxMessage('Generating failed. Please try again');
     setErrorDialog(true);
     setMsgbox(true);     
     return;
    }
    const file = new Blob(temp, {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "accounts.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  const handleCloseScrollDialog = () => {
    setSdlgOpen(false);
  }

  return (
    <div style={{ padding: 16, margin: 'auto', maxWidth: 600 }}>
    <Loading open = {loading} loading_msg = 'Registering user(s)...'/>
    <CssBaseline />
    <Typography variant="h4" align="center" component="h1" gutterBottom>
    Register User
    </Typography>
    <Form
    onSubmit={onSubmit}
    validate={false}
    render={({ handleSubmit, pristine, form, reset, submitting, values }) => (
      <form onSubmit={handleSubmit} noValidate>
      <Paper style={{ padding: 16 }}>
      <Grid container alignItems="flex-start" spacing={2}>
      <Grid item xs={12}>
      <Field
      fullWidth
      required
      name="username"
      component={TextField}
      type="text"
      label="User name"
      />
      </Grid>
      <Grid item xs={12}>
      <Field
      fullWidth
      required
      name="orgname"
      component={Select}
      label="Orginization"
      formControlProps={{ fullWidth: true }}
      >
      {
        orgs.map(org =>(
            <MenuItem 
              key = {Object.keys(org)[0]} 
              value = {Object.keys(org)[0]}
            >
              {org[Object.keys(org)[0]]}
            </MenuItem>
        ))
      }
      </Field>
      </Grid>
      <Grid item xs={12}>
      <Field
      fullWidth
      required
      name="role"
      component={Select}
      label="User role"
      formControlProps={{ fullWidth: true }}
      >
      {
        roles.map(role =>(
            <MenuItem 
              key = {Object.keys(role)[0]} 
              value = {Object.keys(role)[0]}
            >
              {role[Object.keys(role)[0]]}
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
      <Grid item style={{ marginTop: 16 }}>
      <Button
      variant="contained"
      color="primary"
      type="button"
      onClick = {()=>autoGenerate()}
      disabled={submitting || loading}
      >
      Auto-generate
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
    <ScrollDialog
      open = {sdlgOpen}
      data = {sdlgData}
      handleSaveToText = {() => handleSaveToText()}
      handleClose = {() => handleCloseScrollDialog()}
    />
    </div>
    );
}



export default RegisterUser;
