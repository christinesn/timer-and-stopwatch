import React from 'react'

export class Stopwatch extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      displayTime: "00:00:00",
      timeInSeconds: 0,
      countingUp: false
    }

    this.startStopwatch = this.startStopwatch.bind(this)
    this.stopStopwatch = this.stopStopwatch.bind(this)
    this.clearStopwatch = this.clearStopwatch.bind(this)
    this.keyPress = this.keyPress.bind(this)
  }

  startStopwatch () {
    this.setState({
      ...this.state,
      countingUp: true
    })
  }

  countUp () {
    setTimeout(() => {
      if (this.state.countingUp) {
        const newTimeInSeconds = this.state.timeInSeconds + 1

        this.setState({
          ...this.state,
          timeInSeconds: newTimeInSeconds,
          displayTime: this.createDisplayTime(newTimeInSeconds)
        })
      }
    }, 1000)
  }

  createDisplayTime (newTime) {
    const newHours = Math.floor(newTime / 60 / 60)
    const newMinutes = Math.floor((newTime - newHours * 60 * 60) / 60)
    const newSeconds = Math.floor((newTime - newHours * 60 * 60 - newMinutes * 60))

    const newDisplayTime =
      newHours.toString().padStart(2, '0') + ':' +
      newMinutes.toString().padStart(2, '0') + ':' +
      newSeconds.toString().padStart(2, '0')
    
    return newDisplayTime
  }

  stopStopwatch () {
    this.setState({
      ...this.state,
      countingUp: false
    })
  }

  clearStopwatch () {
    this.setState({
      ...this.state,
      timeInSeconds: 0,
      displayTime: "00:00:00"
    })
  }

  componentDidUpdate () {
    if (this.state.countingUp) {
      this.countUp()
    }
  }

  keyPress (e) {
    if (e.keyCode !== 32 && e.keyCode !== 13) { return }

    if (this.state.countingUp) {
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
          {this.state.displayTime}
        </div>
        {
          !this.state.countingUp && (
            <span>
              <button onClick={this.startStopwatch} className="startButton">Start</button>
              <button className="clearButton" onClick={this.clearStopwatch}>Clear</button>
            </span>
          )
        }
        {
          this.state.countingUp && (
            <button className="pauseButton" onClick={this.stopStopwatch}>Pause</button>
          )
        }
      </div>
    )
  }
}
