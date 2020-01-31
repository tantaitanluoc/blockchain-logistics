import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Drawer, Button, 
  List, 
  ListItemText, ListItem,
  AppBar, Toolbar, 
  IconButton, Typography
} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  }
}));

export default function NavBar(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = open =>{
    setOpen(open);
  };
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorNotf, setAnchorNotf] = React.useState(false)

  const openx = Boolean(anchorEl);
  const openN = Boolean(anchorNotf);
  const [count, setCount] = React.useState(-1);
  // let count = 0;

  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleNotf = event =>{
    // count = 0;
    setAnchorNotf(event.currentTarget);
    setCount(0);
    console.log(count)
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseN = () => {
    setAnchorNotf(null);
  };

  let listAction = {
    Done:{name:'Done', value:0,actor:''},
    RequestTrade:{name:'Request Trade',value:0, actor:'IMPORTERORG',index:3},
    AcceptTrade:{name:'Accept Trade',value:0, actor:'EXPORTERORG',index:3},
    RequestLC:{name:'Request LC',value:0, actor:'IMPORTERORG',index:4},
    IssueLC:{name:'Issue LC',value:0, actor:'IMPORTERBANKORG',index:3},
    AcceptLC:{name:'Accept LC',value:0, actor:'EXPORTERBANKORG',index:3},
    RequestEL:{name:'Request EL',value:0, actor:'EXPORTERORG',index:4},
    IssueEL:{name:'Issue EL',value:0, actor:'REGULATORORG',index:3},
    PrepareShipment:{name:'Prepare Shipment',value:0, actor:'EXPORTERORG',index:5},
    RequestCD:{name:'Request CD',value:0, actor:'EXPORTERORG',index:6},
    AcceptCD:{name:'Accept CD',value:0, actor:'REGULATORORG',index:4},
    PayForCD:{name:'Pay For CD',value:0, actor:'EXPORTERBANKORG',index:5},
    AcceptShipmentAndIssueBL:{name:'Accept Shipment And Issue BL',value:0, actor:'CARRIERORG',index:3},
    PayForPrepaidShippingFee:{name:'Pay For Prepaid Shipping Fee',value:0, actor:'',index:0},
    RequestHalfPayment:{name:'Request Half Payment',value:0, actor:'EXPORTERBANKORG',index:4},
    MakeHalfPayment:{name:'Make Half Payment',value:0, actor:'IMPORTERBANKORG',index:4},
    UpdateShipmentLocation:{name:'Update Shipment Location',value:0, actor:'CARRIERORG',index:5},
    RequestCollectShippingFee:{name:'Request Collect Shipping Fee',value:0, actor:'CARRIERORG',index:4},
    PayForCollectShippingFee:{name:'Pay For Collect Shipping Fee',value:0, actor:'',index:0},
    RequestLastPayment:{name:'Request Last Payment',value:0, actor:'EXPORTERBANKORG',index:6},
    MakeLastPayment:{name:'Make Last Payment',value:0, actor:'IMPORTERBANKORG',index:4},
    NotFound:{name:'Not Found',value:0,actor:'',index:-1}
  }

  let action = []


  const getNotifications = (org,ta) => {
    if(ta !== undefined){
      if(ta.length !== 0){
        for(let i=0;i<ta.length;i++){
          // console.log(ta)
          if(ta[i].action === undefined) continue
          if(ta[i].action === "Done") continue
          if(ta[i].action === 'PayForPrepaidShippingFee' || ta[i].action === 'PayForCollectShippingFee'){
            if(ta[i].actor === org){
              listAction[ta[i].action].actor = ta[i].actor
              listAction[ta[i].action].value += 1
              if(ta[i].actor === "EXPORTERBANKORG" && ta[i].action === 'PayForPrepaidShippingFee'){
                listAction[ta[i].action].index = 7
              }
              if(ta[i].actor === "EXPORTERBANKORG" && ta[i].action === 'PayForCollectShippingFee'){
                listAction[ta[i].action].index = 8
              }
              if(ta[i].actor === "IMPORTERBANKORG" && ta[i].action === 'PayForPrepaidShippingFee'){
                listAction[ta[i].action].index = 5
              }
              if(ta[i].actor === "IMPORTERBANKORG" && ta[i].action === 'PayForCollectShippingFee'){
                listAction[ta[i].action].index = 6
              }
            }
          }
          else{
            listAction[ta[i].action].value += 1
          }
        }
      }
    }

    
    let array = Object.keys(listAction);
    // console.log(Object.keys(listAction))
    let temp = 0;
    for (let i=0;i< array.length;i++){
      if(listAction[array[i]].value !== 0 && listAction[array[i]].actor === org){
        temp += listAction[array[i]].value
        action.push({name:listAction[array[i]].name, value:listAction[array[i]].value, index: listAction[array[i]].index})
      }
    }
    if(count === -1 && temp !== 0){
      // console.log(count)
      setCount(temp);
    }
  }
  const notfClick = (action)=> {
    props.handlePage(action.index)
  }
  
  getNotifications(props.org,props.ta)
  
  
  return (
    <div className={classes.root} style={{position:"relative"}}>
      <AppBar position="static">
        
        <Toolbar>
          <Typography variant="h4" className={classes.title}>
            {props.view}
          </Typography>
          <IconButton aria-label="show 11 new notifications" color="inherit">
            <Badge badgeContent={count!==-1?count:0} color="secondary">
              <NotificationsIcon onClick={handleNotf} />
            </Badge>
          </IconButton>
          <Menu
                id="notification-appbar"
                anchorEl={anchorNotf}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={openN}
                onClose={handleCloseN}
              >
                {
                  action.length !== 0?
                    action.map(action => (
                        <MenuItem key={action.name} onClick={()=>notfClick(action)} value={action.name}>
                          {action.name}
                        </MenuItem>
                      ))
                    :<MenuItem key={action.name} value={action.name}> No new action</MenuItem>
                }

                  
          </Menu>
          <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
          </IconButton>
          <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={openx}
                onClose={handleClose}
              >
                <MenuItem >{props.info!==undefined?`${props.info[0]} (${props.info[1]||'Unknown'})`:''}</MenuItem>
                <MenuItem onClick = {props.logout}>Sign out</MenuItem>
          </Menu>
          
        </Toolbar>
      </AppBar>
    </div>

  );
}

