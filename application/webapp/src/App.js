import React,{Component} from 'react';
import Login from './Login.js';
import Carrier from './Carrier.js'
import Exporterbank from './Exporterbank.js'
import Regulator from './Regulator.js'
import Importer from './Importer';
import ImporterBank from './Importerbank';
import Exporter from './Exporter';
import Admin from './Admin';
import cookie from 'universal-cookie';

class App extends Component {
  constructor (props) {
    const cookies = new cookie();
    super(props)
    this.state = {
      user_state: cookies.get("user_state"),
      user_token: cookies.get("user_token"),
      user_org:cookies.get("user_org"),
    }
    this.setValue = this.setValue.bind(this)
    this.cookies = cookies
    this.resetCookies = this.resetCookies.bind(this)
  }
  setValue(value) {
    this.cookies.set("user_state","true",{path:"/"})
    this.cookies.set("user_token",value.user_token,{path:"/"})
    this.cookies.set("user_name",value.user_name,{path:"/"})
    this.cookies.set("user_org", value.user_org, {path:"/"})
    this.setState({ user_token:value.user_token,user_state:value.user_state,user_org:value.user_org},() => console.log(this.state))
  }

  resetCookies(){
    this.cookies.set("user_token","",{path:"/"})
    this.cookies.set("user_state",false,{path:"/"})
    window.location.reload();
  }

  render() {
    if(this.state.user_state === "true" && this.state.user_token !== "" && this.state.user_org !== ""){
      switch (this.state.user_org) {
        case 'regulatororg':
        return (<Regulator token={this.state.user_token} resetCookies={this.resetCookies}/>);
        case 'carrierorg':
        return (<Carrier token={this.state.user_token} resetCookies={this.resetCookies}/>)
        case 'exporterbankorg':
        return (<Exporterbank token={this.state.user_token} resetCookies={this.resetCookies}/>)
        case 'importerorg':
        return (
          <Importer 
          token={this.state.user_token}
          logout = {this.resetCookies}
          />);
        case 'importerbankorg':
        return (
          <ImporterBank 
          token={this.state.user_token}
          logout = {this.resetCookies}
          />
          )
        case 'exporterorg':
        return (
          <Exporter 
          token={this.state.user_token}
          logout = {this.resetCookies}
          />
          )
        case 'orderer':
        return (
          <Admin           
          token={this.state.user_token}
          logout = {this.resetCookies}
          />
          );
        default:
        return (<h1>Welcome to West World</h1>);
      }
    }
    else {
      return(<Login setValue={(val)=>this.setValue(val)} />);
    }
  }
}

export default App;