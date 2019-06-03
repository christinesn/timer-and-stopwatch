import React from 'react'

export class Stopwatch extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      startTime: null,
      running: false,
      time: 0
    }

    this.timer = null

    this.startStopwatch = this.startStopwatch.bind(this)
    this.stopStopwatch = this.stopStopwatch.bind(this)
    this.clearStopwatch = this.clearStopwatch.bind(this)
    this.keyPress = this.keyPress.bind(this)
  }

  startStopwatch () {
    this.setState({
      ...this.state,
      startTime: this.state.startTime ? new Date(Date.now() - this.state.time) : Date.now(),
      running: true
    })
  }

  countUp () {
    this.timer = setTimeout(() => {
      this.setState({
        ...this.state,
        time: Date.now() - this.state.startTime
      })
    }, 10)
  }

  createDisplayTime () {
    const totalSeconds = this.state.time / 1000

    const hours = Math.floor(totalSeconds / 60 / 60)
    const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60)
    const seconds = Math.floor((totalSeconds - hours * 60 * 60 - minutes * 60))

    const displayTime =
      hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0') + ':' +
      seconds.toString().padStart(2, '0')
    
    return displayTime
  }

  stopStopwatch () {
    this.setState({
      ...this.state,
      running: false
    })
    clearTimeout(this.timer)
  }

  clearStopwatch () {
    this.setState({
      ...this.state,
      startTime: null,
      time: 0
    })
  }

  componentDidUpdate () {
    if (this.state.running) {
      this.countUp()
    }
  }

  keyPress (e) {
    if (e.keyCode !== 32 && e.keyCode !== 13) { return }

    if (this.state.running) {
      this.stopStopwatch()
      return
    }

    this.startStopwatch()
  }

  componentDidMount () {
    document.addEventListener("keydown", this.keyPress, false)
  }

  componentWillUnmount () {
    document.removeEventListener("keydown", this.keyPress, false)
  }

  render() {
    return (
      <div className="stopwatch">
        <div className="stopwatchTime" style={{ fontSize: '2em' }}>
          {this.createDisplayTime()}
        </div>
        {
          !this.state.running && (
            <span>
              <button className="startButton" onClick={this.startStopwatch}>Start</button>
              <button className="clearButton" onClick={this.clearStopwatch}>Clear</button>
            </span>
          )
        }
        {
          this.state.running && (
            <button className="pauseButton" onClick={this.stopStopwatch}>Pause</button>
          )
        }
      </div>
    )
  }
}
