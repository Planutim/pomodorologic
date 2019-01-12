const updateBreak = (time)=>{
  return {
    type: 'BREAK',
    time
  }
}
const updateSession = (time)=>{
  return {
    type: 'SESSION',
    time
  }
}

const updateTimer = ()=>{
  return{
    type: 'COUNTDOWN'
  }
}
const resetTimer=()=>{
  return{
    type: 'RESET'
  }
}

//helpers//
const initialState = {time_left:{minutes: 25,seconds: 0},breakTime:5,sessionTime:25,main:'session'}
//timerhelper
const formatTimer = (state)=>{
  if(!state.time_left.minutes&&!state.time_left.seconds){
    $('#beep')[0].play();
    var main=(state.main=='session')?'break':(state.main=='break')?'session':'session';
    return{
      ...state,
      main,
      time_left:{
        minutes: state[main+'Time'],
        seconds: 0
      }
    }
  }
  if(state.time_left.seconds!=0)
    return {
      ...state,
      time_left:
      {minutes: state.time_left.minutes,
      seconds: (state.time_left.seconds-1+60)%60}
    }
  return{
    ...state,
    time_left:
    {minutes: state.time_left.minutes-1,
    seconds: (state.time_left.seconds-1+60)%60}
  }
}
//
const updBrSe = function(brkTime,time){
  var temp=brkTime+time;
  return (temp>0&&temp<61)?temp:brkTime;
}
//rootreducer
const reducer = (state=initialState,action)=>{
  switch(action.type){
    case 'BREAK':
      return {...state,breakTime:updBrSe(state.breakTime,action.time)};
    case 'SESSION':
      return {...state,sessionTime:updBrSe(state.sessionTime,action.time),time_left:{minutes: updBrSe(state.sessionTime,action.time),seconds: 0}};
    case 'COUNTDOWN':
      return {...formatTimer(state)}
    case 'RESET':
      $('#beep')[0].pause();
      $('#beep')[0].currentTime=0;
      return initialState
    default:
      return state
  }
}

const store=Redux.createStore(reducer);
const mapStateToProps = (state)=>{return {timer:state}}
const mapDispatchToProps = (dispatch)=>{
  return{
    updateBreak: (breakTime)=>{dispatch(updateBreak(breakTime))},
    updateSession: (sessionTime)=>{dispatch(updateSession(sessionTime))},
    updateTimer: ()=>{dispatch(updateTimer())},
    resetTimer:()=>{dispatch(resetTimer())}
  }
}


class Pomodoro extends React.Component{
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(){
    
  }
  render(){
    return(
      <div>
        <h1>Pomodoro Clock</h1>
        <Label _id='break' redux={this.props} />
        <Label _id='session' redux={this.props}/>
        <Timer redux={this.props}/>
      </div>
    )
  }
}

class Label extends React.Component{
  constructor(props){
    super(props);
    this.state={
      idToUpper: this.props._id.charAt(0).toUpperCase()+this.props._id.slice(1)
    }
    this.handleClick=this.handleClick.bind(this);
  }
  handleClick(ec){
    this.props.redux['update'+this.state.idToUpper](ec)
  }
  render(){
    return(
      <div className='select-label'>
        <label id={this.props._id+'-label'}>{this.state.idToUpper+' Label'}</label>
        <button id={this.props._id+'-increment'} onClick={()=>this.handleClick(1)}>Inc</button>
        <button id={this.props._id+'-decrement'} onClick={()=>this.handleClick(-1)}>Dec</button>
        <label id={this.props._id+'-length'}>{this.props.redux.timer[this.props._id+'Time']}</label>
      </div>
    )
  }
}

class Timer extends React.Component{
  constructor(props){
    super(props);
    this.state={
      countdown: undefined
    }
    this.handleTimer=this.handleTimer.bind(this);
    this.switchTimers=this.switchTimers.bind(this);
  }
  switchTimers(){
    return 'lol';
  }
  handleTimer(opt){
    if(opt=='start'){
      if(this.state.countdown){
        clearInterval(this.state.countdown)
        this.setState({countdown:undefined})
      }else{
        this.setState({countdown:setInterval(()=>this.props.redux.updateTimer(),1000)})
      }
    }else{
      clearInterval(this.state.countdown);
      this.setState({countdown:undefined})
      this.props.redux.resetTimer();
    }   
  }
  formatTo(num){
    return (num>9)?num:'0'+num;
  }
  render(){
    return(
      <div className='timer-label'>
        <span id='timer-label'>{this.props.redux.timer.main}</span>
        <span id='time-left'>{this.formatTo(this.props.redux.timer.time_left.minutes)}:{this.formatTo(this.props.redux.timer.time_left.seconds)}</span>
        <button id='start_stop' onClick={()=>this.handleTimer('start')}>start</button>
        <button id='reset' onClick={()=>this.handleTimer('reset')}>reset</button>
        <audio id='beep' src='https://goo.gl/65cBl1'></audio>
      </div>
    )
  }
}





//endgame
const Provider = ReactRedux.Provider;
const Container = ReactRedux.connect(mapStateToProps,mapDispatchToProps)(Pomodoro);
class AppWrapper extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    return(
      <Provider store={store}>
        <Container />
      </Provider>
    )
  }
}

ReactDOM.render(<AppWrapper />,document.querySelector('.container'))
