import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Action from './ListAction.js'
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import {IconButton} from '@material-ui/core';
// import Button from '@material-ui/core/Button';
// import Typography from '@material-ui/core/Typography';
// import axios from 'axios';


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function addingSpace(str){
  return str.replace(/([A-Z])/g, ' $1').trim()
}




export function Progress(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [steps, setSteps] = React.useState(null);
  const [giunguyen, setListSteps] = React.useState(null);
  const [paperArray, setPaperArray] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);

  let listStep
  let currentStep
  let listgiunguyen

  if(props.listStep.length !== 0 && props.currentStep !== ""){
    listgiunguyen = props.listStep.slice()
    listStep = props.listStep.slice();
    currentStep = props.currentStep;
    // console.log(listgiunguyen)
    for(let i = 0; i < listStep.length; i++){
      if(listStep[i] === currentStep){
        currentStep = i
      }
    }
  
    for(let i = 0; i < listStep.length; i++){
      listStep[i] = addingSpace(listStep[i])
    }

  }
  

  if(!steps && !activeStep)
  {
    // if(listStep.length > 13){
      // console.log(currentStep)
      setSteps(listStep); // gán dữ liệu nhận được vào state
      setActiveStep(currentStep)
      setListSteps(listgiunguyen)
    // }
  }
   // set bước hiện tại
  

  // const handleNext = () => {
  //   setActiveStep(prevActiveStep => prevActiveStep + 1);
  // };

  // const handleBack = () => {
  //   setActiveStep(prevActiveStep => prevActiveStep - 1);
  // };

  // const handleReset = () => {
  //   setActiveStep(0);
  // };

  const showPaper = async (step) => {
      let temp = steps.indexOf(step)
      let stepstr = await listgiunguyen[temp]
      return Action("paper",stepstr)
  }

  const setItemMenu =(arr) => {
    let res
    for (let i =0; i< arr.length; i++){
      res += <MenuItem> arr[i]</MenuItem>
    }
    return res
  }
  const handleOnClick = async (step) =>{
    let arr = await showPaper(step)
    // let arrr = await setItemMenu(arr)
    console.log(arr)
  }

  return ( steps != null ?
    <div className={classes.root}>
        <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step onClick ={()=>{handleOnClick(label);}} key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
        </Stepper>
    </div> : null
  );
}


// function test(){
//   return(
//     <div>
//         {activeStep === steps.length ? (
//           <div>
//             <Typography className={classes.instructions}>All steps completed</Typography>
//             <Button onClick={handleReset}>Reset</Button>
//           </div>
//         ) : (
//           <div>
//             <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
//             <div>
//               <Button
//                 disabled={activeStep === 0}
//                 onClick={handleBack}
//                 className={classes.backButton}
//               >
//                 Back
//               </Button>
//               <Button variant="contained" color="primary" onClick={handleNext}>
//                 {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     )
// }

// function getStepContent(stepIndex) {
//   switch (stepIndex) {
//     case 0:
//     return 'Select campaign settings...';
//     case 1:
//     return 'What is an ad group anyways?';
//     case 2:
//     return 'This is the bit I really care about!';
//     case 3:
//     return 'Tui xin tự giới thiệu';
//     case 4:
//     return 'Tui là đệ nhất quốc sư Hoa Kỳ';
//     case 5: 
//     return 'Cố dấn tối cao của tổng thống Đô nan Chum';
//     case 6: 
//     return 'Mày chửi thề là tao bắn mày liền';
//     default:
//     return 'Unknown stepIndex';
//   }
// }

export default Progress;