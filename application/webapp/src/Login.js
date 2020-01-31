import React from 'react';
import axios from  'axios';
import * as Const from './components/const';


// // thư viện đồ họa
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import {CustomizedDialogs} from './components/custom-form';
import Wall from './assets/wall.jpg';


  const options = [
    'Choose your organization',
    'Importer',
    'Importer Bank',
    'Exporter',
    'Exporter Bank',
    'Carrier',
    'Regulator',
    'Admin'
  ];
  const orgs = [
    'illuminati',
    'importerorg',
    'importerbankorg',
    'exporterorg',
    'exporterbankorg',
    'carrierorg',
    'regulatororg',
    'orderer'
  ];

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://i.kym-cdn.com/entries/icons/original/000/028/367/cover1.jpg">
        T&T
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url('+Wall+')',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Login(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    user_token:'',
    user_org:'',
    user_state:'',
    user_name:`${localStorage.getItem('user_name')||''}`,
    user_password:`${localStorage.getItem('user_password')||''}`,
    user_org:`${localStorage.getItem('user_org_index')?orgs[localStorage.getItem('user_org_index')]:'importerorg'}`,
    remembered: localStorage.getItem('user_name')?true:false,
    anchorEl:null,
    selectedIndex:`${localStorage.getItem('user_org_index')||1}`,
    // hộp thoại thông báo lỗi
    error:{
        msgbox: false,
        msgboxTitle:'',
        msgboxMessage:'',
    }
  })
  const handleUsername = evt =>{
    setState({...state,user_name:evt.target.value});
  };
  const handlePassword = evt =>{
    setState({...state,user_password:evt.target.value});

  }
  const redirect = ()=>{
    window.location.reload();
  }
  const onSubmit = evt =>{
    evt.preventDefault();

    if(state.user_name && state.user_password){
      if(state.remembered){
        localStorage.setItem('user_name', state.user_name);
        localStorage.setItem('user_password', state.user_password);
        localStorage.setItem('user_org_index', state.selectedIndex);
      } else {
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_password');
        localStorage.removeItem('user_org_index', state.selectedIndex);
      }
      let params = {
        username: `${state.user_name}`,
        password: `${state.user_password}`,
        orgname: `${state.user_org}`,
      }
        // hằng số lấy từ file ./components/const.js
        axios.post(Const.Server.login_path, params)
        .then(res =>{
            var temp = {
              user_name: state.user_name,
              user_org: state.user_org,
              user_token: res.data.token,
              user_state: true,
            }
            // gửi dữ liệu về component cha (App.js)
            props.setValue(temp);
            // load lại trang
            redirect();
          })
        .catch(err =>{
          // hiện thông báo lỗi
          setState({
            ...state,
            error:{
              msgbox: true,
              msgboxTitle: "Login failed",
              msgboxMessage: `Failed to login as '${state.user_name}', please try again!!!`
            }
          });
        })

      }
  }
  
  // các điều khiển dành cho menu chọn orgs
  const handleCloseMenu = () =>{
    setState({...state, anchorEl: null});
  }
  const handleMenuItemClick = (event, index) => {
    setState({
        ...state,
        selectedIndex:index,
        user_org: orgs[index],
        anchorEl: null
    });
  };
  const handleCLickList = event =>{
    setState({...state, anchorEl: event.currentTarget});
  }

  // điều khiển đóng thông báo lỗi
  const handleCloseDialog = () =>{
    setState({
        ...state,
        error:{
          msgbox:false
        }
    });
  }
  const rememberMe = (evt) =>{
    setState({
      ...state,
      remembered: !state.remembered,
    })
  }
  const account = [
    {"username":"impmng0","orgname":"importerorg","role":"manager",password:"SJZmdghzWdrD"},
      {"username":"impact0","orgname":"importerorg","role":"accountancy",password:"dxPWFfVuISQO"},
      {"username":"expmng0","orgname":"exporterorg","role":"manager",password:"IEVTuMRAJKgU"},
      {"username":"expact0","orgname":"exporterorg","role":"accountancy",password:"hyYiiqXULqkh"},
      {"username":"impbankmng0","orgname":"importerbankorg","role":"manager",password:"CGbuOTufUsHM"},
      {"username":"impbankact0","orgname":"importerbankorg","role":"accountancy",password:"hKWEwwLfbGnU"},
      {"username":"expbankmng0","orgname":"exporterbankorg","role":"manager",password:"UGPvSbIwwxIV"},
      {"username":"expbankact0","orgname":"exporterbankorg","role":"accountancy",password:"XTwhGCrmUBRk"},
      {"username":"carmng0","orgname":"carrierorg","role":"manager",password:"CkFmElFmWsEo"},
      {"username":"caract0","orgname":"carrierorg","role":"accountancy",password:"sbbgVOiWZUvc"},
      {"username":"regmng0","orgname":"regulatororg","role":"manager",password:"IBAkPZWxkQOw"},
      {"username":"regact0","orgname":"regulatororg","role":"accountancy",password:"nucNgduQTZfE"}

  ]

  return (
    <div>
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate onSubmit={evt => onSubmit(evt)}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={state.user_name||''}
              onChange = {handleUsername}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange = {handlePassword}
              value = {state.user_password||''}
            />
            <List component='nav'>
                <ListItem
                    button
                    onClick = {handleCLickList}
                >
                    <ListItemText primary='Organization' secondary = {options[state.selectedIndex]}/>
                </ListItem>
            </List>
            <Menu
                id='lock-menu'
                anchorEl = {state.anchorEl}
                keepMounted
                open = {Boolean(state.anchorEl)}
                onClose = {handleCloseMenu}
            >
                {options.map((option, index) => (
                  <MenuItem
                    key={option}
                    disabled={index === 0}
                    selected={index === state.selectedIndex}
                    onClick={event => handleMenuItemClick(event, index)}
                  >
                    {option}
                  </MenuItem>
              ))}
            </Menu>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" checked={Boolean(state.remembered)} onChange = {() => rememberMe()} />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
    <CustomizedDialogs
      open = {state.error.msgbox}
      handleClose = {() => handleCloseDialog()}
      dialog_title = {state.error.msgboxTitle}
      dialog_message = {state.error.msgboxMessage}
      error = {true}
    />
    </div>
  );
}

export default Login;