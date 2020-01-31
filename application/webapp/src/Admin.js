import React from 'react';
import './components/components.css';
import Drawer from './components/drawers';
import Profile from './components/profile';
import RegisterUser from './components/register-users';
import CreateLogisticsApp from './components/create-app';
import axios from 'axios';
import {Loading} from './components/custom-form';



class Admin extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,
      components: 1,
      user_role:"",
      user_name:"",
      user_org:"",
    }
  
  }
  componentDidMount(){
      this.setState({
          user_name:"Admin",
          user_org:"admin",
          user_role:"manager",
          loading:false
          })
  }
  handleNav(index){
    this.setState({components:index});
  }
  renderPage(){
    switch (this.state.components) {
      case 0:
      return  <div>{this.state.loading ?
                <Loading open = {this.state.loading}/>
                :
                <Profile user={{name:this.state.user_name,role:this.state.user_role,org:this.state.user_org, bal:"0"}} />
                  }
            </div>
      case 1: 
      return <RegisterUser />
      case 2:
      return <CreateLogisticsApp />
      default:
      return <Profile />
    }
  }
  render(){
    let body = this.renderPage()
      return (
        <div>
        <Drawer 
          logout = {()=>this.props.logout()}
          handleNav = {(index)=>{this.handleNav(index)}} 
          info = {[this.state.user_name,this.state.user_role]}
          items = {['Home', 'Register User', 'Create Logistics App']}
          body={body}
          view = 'Network Administrator'
        />
        </div>
    );
  }
}



export default Admin;
