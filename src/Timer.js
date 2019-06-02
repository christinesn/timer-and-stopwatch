import React from 'react'
import InputMask from 'react-input-mask'

export class Timer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      time: "00:00:00",
      countingDown: false,
      alarmPlaying: false
    }

    this.alarm = new Audio()
    this.alarm.src = "alarm.mp3"
    this.alarm.loop = true
    this.alarm.autoplay = false
    this.alarm.preload = "auto"

    this.handleChange = this.handleChange.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.pauseTimer = this.pauseTimer.bind(this)
    this.countDown = this.countDown.bind(this)
    this.decrementTime = this.decrementTime.bind(this)
    this.stopAlarm = this.stopAlarm.bind(this)
    this.spacePress = this.spacePress.bind(this)
  }

  handleChange (e) {
    this.setState({
      ...this.state,
      time: e.target.value
    })
  }

  startTimer (e) {
    e && e.preventDefault()

    this.setState({
      ...this.state,
      countingDown: true
    })
  }

  clearInput () {
    this.setState({
      ...this.state,
      time: "00:00:00"
    })
  }

  pauseTimer () {
    this.setState({
      ...this.state,
      countingDown: false
    })
  }

  countDown () {
    setTimeout(() => {
      /**
       * Check should be inside the timeout,
       * in case the timer is paused mid-second.
       */
      if (this.state.countingDown) {
        this.setState({
          ...this.state,
          time: this.decrementTime()
        })
      }
    }, 1000)
  }

  decrementTime () {
    let newHours = 0
    let newMinutes = 0
    let newSeconds = 0

    const hours = parseInt(this.state.time.slice(0, 2))
    const minutes = parseInt(this.state.time.slice(3, 5))
    const seconds = parseInt(this.state.time.slice(6, 8))

    newSeconds = seconds - 1
    if (newSeconds < 0) {
      newSeconds = 59
      newMinutes = minutes - 1

      if (newMinutes < 0) {
        newMinutes = 59
        newHours = hours - 1
      } else {
        newHours = hours
      }
    } else {
      newMinutes = minutes
      newHours = hours
    }

    const newTime =
      newHours.toString().padStart(2, '0') + ":" +
      newMinutes.toString().padStart(2, '0') + ":" +
      newSeconds.toString().padStart(2, '0')

    return newTime
  }

  stopAlarm () {
    this.setState({
      ...this.state,
      alarmPlaying: false,
      countingDown: false
    })

    this.alarm.pause()
  }

  componentDidUpdate () {
    if (this.state.countingDown && this.state.time !== "00:00:00") {
      this.countDown()
    }

    if (this.state.countingDown && this.state.time === "00:00:00" && !this.state.alarmPlaying) {
      this.alarm.play()
      this.setState({
        ...this.state,
        alarmPlaying: true,
        countingDown: false
      })
    }
  }

  spacePress (e) {
    if (e.keyCode !== 32) { return }

    if (this.state.countingDown) {
      this.pauseTimer()
      return
    }

    if (this.state.alarmPlaying) {
      this.stopAlarm()
      return
    }

    this.startTimer()
  }

  componentDidMount () {
    document.addEventListener("keydown", this.spacePress, false)
  }

  componentWillUnmount () {
    document.removeEventListener("keydown", this.spacePress, false)
  }

  render () {
    return (
      <form onSubmit={this.startTimer} className="timerForm">
        <div>hours : minutes : seconds</div>
        <InputMask
          formatChars={{
            '9': '[0-9]',
            '5': '[0-5]'
          }}
          mask="99:59:59"
          maskChar="0"
          value={this.state.time}
          onChange={this.handleChange}
          alwaysShowMask={true}
          style={{
            fontSize: '2em'
          }}
          disabled={this.state.countingDown || this.state.alarmPlaying}
          className="timeInput"
        />

        <div>
          {
            !this.state.countingDown && !this.state.alarmPlaying && (
              <span>
                <button type="submit" className="startButton">
                  Start
                </button>
                <button type="button" onClick={this.clearInput} className="clearButton">
                  Clear
                </button>
              </span>
            )
          }
          {
            this.state.countingDown && !this.state.alarmPlaying && (
              <button onClick={this.pauseTimer} className="pauseButton">
                Pause
              </button>
            )
          }
          {
            this.state.alarmPlaying && (
              <button onClick={this.stopAlarm} className="stopButton">
                Stop
              </button>
            )
          }
        </div>
      </form>
    )
  }
}
