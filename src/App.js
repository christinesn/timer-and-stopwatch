import React from 'react';
import {Stopwatch} from './Stopwatch';
import {Timer} from './Timer';
import {Tabs, Tab} from 'react-bootstrap'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      key: 'timer'
    }
  }

  render () {
    return (
      <div className="App">
        <Tabs
          defaultActiveKey="timer"
          id="switcher"
          transition={false}
          onSelect={key => this.setState({ key })}
        >
          <Tab eventKey="timer" title="Timer">
            { this.state.key === 'timer' && (<Timer />) }
          </Tab>
          <Tab eventKey="stopwatch" title="Stopwatch">
            { this.state.key === 'stopwatch' && (<Stopwatch />) }
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default App;
