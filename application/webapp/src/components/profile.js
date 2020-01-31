import React from 'react';
import { 
        makeStyles, Typography,
         Paper, Box 
} from '@material-ui/core';
import {CustomizedDialogs} from './custom-form';
import Grid from '@material-ui/core/Grid';
import Importer from '../assets/importer.png';
import Bank from '../assets/bank.png';
import Exporter from '../assets/exporter.png';
import Carrier from '../assets/carrier.png'
import Cookies from 'universal-cookie';
import Regulator from '../assets/regulator.png'
import Admin from '../assets/admin.png'

const cookies = new Cookies();

const useStyles = makeStyles({
  avatar: {
    marginBottom: 100,
  },
  logo: {
    margin: 10,
    width: 100,
    height: 100,
  },
  contents:{
    margin: 10,
  },
  contentTitle:{
    fontWeight: 'fontWeightBold',
  }
});
const orgs = {
  importerorg: "The Importer",
  exporterorg: "The Exporter",
  importerbankorg: "The Importer Bank",
  exporterbankorg: "The Exporter Bank",
  carrierorg: "The Carrier",
  regulatororg: "The Regulator",
  admin: "The Admin Org"
}
export default function Profile(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    loading: false,
    ready:false,
    error_dialog:{
      open: false,
      dlgTitle: '',
      dlgMessage: '',
      errorDialog: true,
    }
  });
  const [avatar, setAvatar] = React.useState(null);
  // const {...rest} = props;
  React.useEffect(()=>{
    setState({
      ...state,
      loading: true,
    });
    let user_org = cookies.get('user_org');
    let entity = user_org
    if(entity === 'importerorg')
      setAvatar(Importer);
    else if(entity === 'importerbankorg' || entity === 'exporterbankorg')
      setAvatar(Bank);
    else if(entity === 'exporterorg')
      setAvatar(Exporter);
    else if(entity === 'carrierorg')
      setAvatar(Carrier);
    else if(entity === 'regulatororg')
      setAvatar(Regulator);
    else if(entity === 'orderer')
      setAvatar(Admin);
  },[]);

  const handleCloseCustomizedDialogs = () =>{
    setState({
      ...state,
      error_dialog:{
        open: false,
      },
    });
  }


  return (
    <div style={{ padding: 16, margin: 'auto'}}>
    <Paper style={{ padding: 16 }}>
    <Grid container justify="center" alignItems="flex-start">
      <Grid container justify="center" className={classes.avatar}>
        <div align='center'>
          <img alt="Remy Sharp" src={avatar} align='center' className={classes.logo} />
        <Typography variant="h4" component="h1" gutterBottom>
                {props.user.name || 'Pending'}
        </Typography>
        </div>
      </Grid>

      <Grid container alignItems="flex-start" justify="center">
        <Grid item xs={2} className={classes.contents}>
          <Typography variant="subtitle1" align="right" component="h2" gutterBottom>
                  <Box fontWeight = 'fontWeightBold' >Organization</Box>
          </Typography>
        </Grid>
        <Grid item xs={2} className={classes.contents}>
          <Typography variant="subtitle1" align="left" component="h1" gutterBottom>
                  {orgs[props.user.org] || 'Pending'}
          </Typography>
        </Grid>
      </Grid>

      <Grid container alignItems="flex-start" justify="center">
        <Grid item xs={2} className={classes.contents}>
          <Typography variant="subtitle1" align="right" component="h2" gutterBottom>
                  <Box fontWeight = 'fontWeightBold' >User role</Box>
          </Typography>
        </Grid>
        <Grid item xs={2} className={classes.contents}>
          <Typography variant="subtitle1" align="left" component="h1" gutterBottom>
                  {props.user.role || 'Pending'}
          </Typography>
        </Grid>
      </Grid>

      <Grid container alignItems="flex-start" justify="center">
        <Grid item xs={2} className={classes.contents}>
          <Typography variant="subtitle1" align="right" component="h2" gutterBottom>
                  <Box fontWeight = 'fontWeightBold' >Organization's balance</Box>
          </Typography>
        </Grid>
        <Grid item xs={2} className={classes.contents}>
          <Typography variant="subtitle1" align="left" component="h1" gutterBottom>
                  {props.user.bal!==undefined?props.user.bal : 'Pending'}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
    </Paper>
    <CustomizedDialogs
              error = {state.error_dialog.errorDialog}
              dialog_title = {state.error_dialog.dlgTitle}
              dialog_message = {state.error_dialog.dlgMessage}
              open = {state.error_dialog.open}
              handleClose = {()=>{handleCloseCustomizedDialogs()}}
      />
    </div>
  );
}