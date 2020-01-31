import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import {
  AppBar, Toolbar, Grid,
  MenuItem, Box, Divider, Select,
  InputLabel
} from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import DateFnsUtils from '@date-io/date-fns';
import LinearProgress from '@material-ui/core/LinearProgress';

import CircularProgress from '@material-ui/core/CircularProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  DatePicker
} from '@material-ui/pickers';
import * as Const from './const';

import Progress from './stepper';


//////////////////////////////////

function DatePickerWrapper(props) {
  const {
    input: { name, onChange, value, ...restInput },
    meta,
    ...rest
  } = props;
  const showError =
    ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
    meta.touched;

  return (
    <DatePicker
      {...rest}
      name={name}
      helperText={showError ? meta.error || meta.submitError : undefined}
      error={showError}
      inputProps={restInput}
      onChange={onChange}
      value={value === '' ? null : value}
    />
  );
}

function InputForRequestCD(props){
  const useStyles = makeStyles(theme => ({
    formControl: {
      // margin: theme.spacing(1),
      minWidth: 120,
    },
  }));
  const classes = useStyles();
  const [list_ports] = React.useState(Const.Chaincode.list_ports);
  const [state, setState] = React.useState({
    issueDate: new Date(),
    typeOfPaper: '',
    reasonOfTrade: '',
    sourcePort: '',
  })
  const handleIssueDate = date =>{
    setState({
      ...state,
      issueDate:date
    })
  };
  const handleChangeSourcePort = evt =>{
    setState({
      ...state,
      sourcePort: evt.target.value,
    });
  };
  const handleChangeTypeOfPaper = evt =>{
    setState({
      ...state,
      typeOfPaper: evt.target.value,
    });
  }
  const handleChangeReasonOfTrade = evt =>{
    setState({
      ...state,
      reasonOfTrade: evt.target.value,
    });
  }
  return (
    <div>
      <Dialog open={props.open} onClose={()=>{props.handleClose()}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.dialog_title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.content_text}
          </DialogContentText>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container>
              <KeyboardDatePicker
                variant="inline"
                format="MM-dd-yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Issue Date"
                value={state.issueDate}
                onChange={handleIssueDate}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
          <TextField
            margin="dense"
            label="Type of paper"
            fullWidth
            value = {state.typeOfPaper}
            onChange = {handleChangeTypeOfPaper}
          />
          <TextField
            margin="dense"
            label="Reason of trade"
            fullWidth
            value = {state.reasonOfTrade}
            onChange = {handleChangeReasonOfTrade}
          />
        <FormControl className={classes.formControl}>
        <InputLabel>Source port</InputLabel>
          <Select
            label="Source port"
            value={state.sourcePort}
            onChange={handleChangeSourcePort}
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
          </Select>
        </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{props.handleClose()}} color="primary">
            Cancel
          </Button>
          <Button onClick={()=>{props.handleSubmit(state)}} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



/////////////////////////////////////////////////////////



function CustomizedDialogs(props) {
  const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    color: `${props.error ? 'red':'#3f51b5'}`,
    minWidth: '400px'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  });

  const DialogTitle = withStyles(styles)(props => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

  const DialogContent = withStyles(theme => ({
    root: {
      padding: theme.spacing(2),
    },
  }))(MuiDialogContent);

  const DialogActions = withStyles(theme => ({
    root: {
      margin: 0,
      padding: theme.spacing(1),
    },
  }))(MuiDialogActions);

  return (
    <div>
      <Dialog onClose={()=>{props.handleClose()}} aria-labelledby="customized-dialog-title" open={props.open}>
        <DialogTitle id="customized-dialog-title" onClose={()=>{props.handleClose()}}>
          {props.dialog_title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            {props.dialog_message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{props.handleClose()}} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


////////////////////////////////////////

const handleButton =(open, close, data) =>{
  switch(data.action){
    case "RequestPaymentLast":
      console.log("RequestPaymentLast")
      return open()
  }
}




const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

function ProgressDialogs(props) {
  const useStyles = makeStyles(theme => ({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    dialogg:{
      height: '50%',
      marginTop: '30%'
    },
  }));
  const classes = useStyles();

  return (
    <div>
      <Dialog className={classes.dialogg} fullScreen open={props.open} onClose={props.handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={props.handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Workflow proccess for trade {props.tradeID}
            </Typography>
          </Toolbar>
        </AppBar>
        <Progress
          tradeID = {props.tradeID}
          listStep = {props.steps}
          currentStep = {props.activeStep}
        />
        {props.button ?
            <Button variant="contained" onClick={()=>{props.function() ;}} color="primary" className={classes.button}>{props.buttonLabel}</Button>
          :null
        }

      </Dialog>
    </div>
  );
}


///////////////////////
function InputIssueAndExpDate(props){
  const [state, setState] = React.useState({
    issueDate: new Date(),
    expDate: new Date(),
  })
  const handleIssueDate = date =>{
    setState({
      ...state,
      issueDate:date
    })
  };
  const handleExpDate = date =>{
    setState({
      ...state,
      expDate:date
    })
  }
  return (
    <div>
      <Dialog open={props.open} onClose={()=>{props.handleClose()}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.dialog_title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.content_text}
          </DialogContentText>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container justify="space-around">
                  <KeyboardDatePicker
                    variant="inline"
                    format="MM-dd-yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Issue Date"
                    value={state.issueDate}
                    onChange={handleIssueDate}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                  <KeyboardDatePicker
                    variant="inline"
                    format="MM-dd-yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Expire Date"
                    value={state.expDate}
                    onChange={handleExpDate}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{props.handleClose()}} color="primary">
            Cancel
          </Button>
          <Button onClick={()=>{props.handleSubmit(state)}} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function NoArgument(props) {
  return (
    <div>
      <Dialog open={props.open} onClose={()=>{props.close()}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.dialog_title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.content_text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{props.close()}} color="primary">
            Cancel
          </Button>
          <Button onClick={()=>{props.handleSubmit()}} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

/////////////////////////////////////////////////////

function ConfirmDialog(props) {

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{props.dlgTitle}</DialogTitle>
        <DialogContent>
          {props.dlgMessage?props.dlgMessage.map(message => (
            <DialogContentText>
            {message}
          </DialogContentText>
          )):null}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={props.handleSubmit} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



///////////////////

function InputForAcceptTrade(props){
  const useStyles = makeStyles(theme => ({
    formControl: {
      marginTop: theme.spacing(3),
      marginLeft: theme.spacing(3),
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
    textField2: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 50,
    },
  }));

  const classes = useStyles();

  const [state, setState] = React.useState({
    charges_payer: 'Exporter',
    price_per_goods: 0,
    currency: 'USD',
  });

  const handleChangeCharges = event => {
    setState({
      ...state,
      charges_payer: event.target.value
    });
  };
  const handleChangePrice = name => event => {
    setState({
      ...state,
      [name]: event.target.value,
    });
  }
  const handleChangeCurrency = event =>{
    setState({
      ...state,
      currency: event.target.value,
    });
  }

  return (
    <div>
      <Dialog open={props.open} onClose={()=>{props.handleClose()}} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Accept Trade Agreement for trade "{props.tradeID}"</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {props.content_text}
          </DialogContentText>
        <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Charges</FormLabel>
        <RadioGroup 
          aria-label="freight" 
          name="freight" 
          value={state.charges_payer}
          onChange={handleChangeCharges}
        >
          <FormControlLabel
            value="Exporter"
            control={<Radio color="primary" />}
            label="Shipper"
            defaultChecked={true}
          />
          <FormControlLabel
            value="Importer"
            control={<Radio color="primary" />}
            label="Consignee"
          />
        </RadioGroup>
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
      <FormLabel component="legend">Price per goods</FormLabel>
      <div>
        <TextField
            id="standard-number"
            value={state.price_per_goods}
            onChange={handleChangePrice('price_per_goods')}
            type="number"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
        />
        <TextField
          id="standard-select-currency"
          select
          className={classes.textField2}
          value={state.currency}
          onChange={handleChangeCurrency}
          SelectProps={{
            MenuProps: {
              className: classes.menu,
            },
          }}
          margin="normal"
        >
          {Const.Chaincode.currencies.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
      </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{props.handleClose()}} color="primary">
            Cancel
          </Button>
          <Button onClick={()=>{props.handleSubmit(state)}} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function ScrollDialog(props) {
  const useStyles = makeStyles(theme =>({
    dlg_content:{
      marginTop: theme.spacing(3),
    },
  }));

  const classes = useStyles();

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    const { current: descriptionElement } = descriptionElementRef;
    if (descriptionElement !== null) {
      descriptionElement.focus();
    }
  }, [props.open]);

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={()=>props.handleClose()}
        scroll="body"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">List Accounts</DialogTitle>
        <DialogContent>
        <DialogContentText
          id="scroll-dialog-description"
          ref={descriptionElementRef}
          tabIndex={-1}
        >
          Those account(s) has been sucessfully created:
        </DialogContentText>
        {
          props.data.map(user=>(
            <DialogContentText key={user.username} className={classes.dlg_content}>
              <Typography>
                Username: {user.username}
              </Typography>
              <Typography>
                Orgname: {user.orgname}
              </Typography>
              <Typography>
                Role: {user.role}
              </Typography>
              <Typography>
                Secret: {user.secret}
              </Typography>
              <Divider variant="inset"/>
            </DialogContentText>
          ))
        }
        </DialogContent>
        <DialogActions>
          <Button onClick = {()=>props.handleSaveToText()} color="secondary">
            Save to text file
          </Button>
          <Button onClick={()=>props.handleClose()} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function Loading(props) {
  const circularSize = props.size||80;
  const heading = props.heading||'Stay calm, this action could take a while.';
  const loading_msg = props.loading_msg||'Please wait...';


  ////////////////////////////////////////////////////////////////////////////////////////////
  /// Gửi lời cảm ơn chân thành tới bạn Nga dễ thương nhất vũ trụ đã hỗ trợ mình đoạn này ///
  //////////////////////////////////////////////////////////////////////////////////////////


  const useStyles = makeStyles(theme => ({
    root: {
      textAlign: 'center'
    },
    circular: {
      position: 'relative',
      top: '40%',
    },
    dlg_contents:{
      margin: theme.spacing(2)
    }
  }));
  const classes = useStyles();
  return (
    <Dialog open = {props.open} className = {classes.root}>
      <DialogContent className={classes.dlg_contents}>
      <div className={classes.circular}>
      <Typography>{heading}</Typography>
        <CircularProgress size={circularSize}/>
      <Typography><Box fontWeight='fontWeightBold'>{loading_msg}</Box></Typography>
      </div>
      </DialogContent>
    </Dialog>
  );
}

export {
  InputForRequestCD, NoArgument, CustomizedDialogs, 
  ProgressDialogs, DatePickerWrapper,
  InputIssueAndExpDate, ConfirmDialog,
  Loading, InputForAcceptTrade, ScrollDialog
};