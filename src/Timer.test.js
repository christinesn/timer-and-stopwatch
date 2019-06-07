import React from 'react'
import {Timer} from './Timer'
import {shallow} from 'enzyme'
import sinon from 'sinon'
import InputMask from 'react-input-mask'

jest.useFakeTimers()
let sandbox

window.HTMLMediaElement.prototype.play = sinon.spy()
window.HTMLMediaElement.prototype.pause = sinon.spy()

document.addEventListener = sinon.spy()
document.removeEventListener = sinon.spy()

describe('Timer', () => {
  it('Renders without error', () => {
    try {
      shallow(<Timer />)
    } catch (error) {
      console.log(error)
      fail(`Rendering Timer threw the error: ${error.message}`)
    }
  })

  describe('handleChange()', () => {
    it('Changes the stored time', () => {
      const wrapper = shallow(<Timer />)
      const e = {
        target: {
          value: 'newTime'
        }
      }

      wrapper.instance().handleChange(e)

      expect(wrapper.state().time).toEqual('newTime')
    })
  })

  describe('startTimer()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe("If there's an event object", () => {
      it('Calls preventDefault()', () => {
        const wrapper = shallow(<Timer />)
        const e = {
          preventDefault: sinon.spy()
        }

        wrapper.instance().startTimer(e)

        expect(e.preventDefault.called).toEqual(true)
      })
    })

    it('Sets the countingDown state to true', () => {
      const wrapper = shallow(<Timer />)
      wrapper.instance().startTimer()
      expect(wrapper.state().countingDown).toEqual(true)
    })
  })

  describe('clearInput()', () => {
    it('Sets the time back to 00:00:00', () => {
      const wrapper = shallow(<Timer />)

      wrapper.setState({ time: "01:30:30" })
      expect(wrapper.state().time).toEqual("01:30:30")

      wrapper.instance().clearInput()

      expect(wrapper.state().time).toEqual("00:00:00")
    })
  })

  describe('pauseTimer()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Sets the countingDown state to false', () => {
      const wrapper = shallow(<Timer />)

      wrapper.setState({ countingDown: true })
      expect(wrapper.state().countingDown).toEqual(true)

      wrapper.instance().pauseTimer()
      expect(wrapper.state().countingDown).toEqual(false)
    })

    it('Clears any ongoing countdown intervals', () => {
      const wrapper = shallow(<Timer />)
      wrapper.instance().pauseTimer()

      expect(clearTimeout).toHaveBeenCalled()
    })
  })

  describe('countDown()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'decrementTime').returns('newTime')
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Waits one second, then calls decrementTime()', () => {
      const wrapper = shallow(<Timer />)
      wrapper.setState({ countingDown: true })
      wrapper.instance().countDown()

      jest.runAllTimers()

      expect(wrapper.state().time).toEqual('newTime')
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
    })
  })

  describe('decrementTime()', () => {
    it('Decrements the time left by one second (and returns the new time)', () => {
      const wrapper = shallow(<Timer />)

      wrapper.setState({ time: "00:01:15" })
      expect(wrapper.instance().decrementTime()).toEqual("00:01:14")

      wrapper.setState({ time: "01:35:00" })
      expect(wrapper.instance().decrementTime()).toEqual("01:34:59")

      wrapper.setState({ time: "55:00:00" })
      expect(wrapper.instance().decrementTime()).toEqual("54:59:59")

      wrapper.setState({ time: "00:00:01" })
      expect(wrapper.instance().decrementTime()).toEqual("00:00:00")
    })
  })

  describe('stopAlarm', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Sets both the countingDown and the alarmPlaying state to false', () => {
      const wrapper = shallow(<Timer />)

      wrapper.setState({ alarmPlaying: true, countingDown: true })
      wrapper.instance().stopAlarm()

      expect(wrapper.state().alarmPlaying).toEqual(false)
      expect(wrapper.state().countingDown).toEqual(false)
    })

    it('Stops the alarm', () => {
      window.HTMLMediaElement.prototype.pause.resetHistory()

      const wrapper = shallow(<Timer />)
      wrapper.instance().stopAlarm()

      expect(window.HTMLMediaElement.prototype.pause.callCount).toEqual(1)
    })
  })

  describe('componentDidUpdate()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'countDown')
    })

    afterEach(() => {
      sandbox.resetHistory()
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('If the timer is currently counting down and has not yet reached 0', () => {
      it('Continues the countdown', () => {
        const wrapper = shallow(<Timer />)

        wrapper.setState({ countingDown: true, time: "00:00:01" })

        sandbox.assert.calledOnce(Timer.prototype.countDown)
      })
    })

    describe('If the timer is counting down and has just reached 0', () => {
      it('Starts the alarm', () => {
        window.HTMLMediaElement.prototype.play.resetHistory()

        const wrapper = shallow(<Timer />)

        wrapper.setState({ countingDown: true, time: "00:00:00" })

        expect(wrapper.state().alarmPlaying).toEqual(true)
        expect(wrapper.state().countingDown).toEqual(false)
        expect(window.HTMLMediaElement.prototype.play.callCount).toEqual(1)
        sandbox.assert.notCalled(Timer.prototype.countDown)
      })

      it('Clears any ongoing countdown intervals', () => {
        const wrapper = shallow(<Timer />)

        wrapper.setState({ countingDown: true, time: "00:00:00" })

        expect(clearTimeout).toHaveBeenCalled()
      })
    })
  })

  describe('spacePress()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'pauseTimer')
      sandbox.stub(Timer.prototype, 'stopAlarm')
      sandbox.stub(Timer.prototype, 'startTimer')
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterEach(() => {
      sandbox.resetHistory()
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('If the key pressed is not space', () => {
      it('Does nothing', () => {
        const e = { keyCode: 1 }
        const wrapper = shallow(<Timer />)

        wrapper.instance().spacePress(e)

        sandbox.assert.notCalled(Timer.prototype.pauseTimer)
        sandbox.assert.notCalled(Timer.prototype.stopAlarm)
        sandbox.assert.notCalled(Timer.prototype.startTimer)
      })
    })

    describe('If space is pressed while the timer is counting down', () => {
      it('Pauses the timer', () => {
        const e = { keyCode: 32 }
        const wrapper = shallow(<Timer />)

        wrapper.setState({ countingDown: true })
        wrapper.instance().spacePress(e)

        sandbox.assert.calledOnce(Timer.prototype.pauseTimer)
        sandbox.assert.notCalled(Timer.prototype.stopAlarm)
        sandbox.assert.notCalled(Timer.prototype.startTimer)
      })
    })

    describe('If space is pressed while the alarm is playing', () => {
      it('Stops the alarm', () => {
        const e = { keyCode: 32 }
        const wrapper = shallow(<Timer />)

        wrapper.setState({ alarmPlaying: true })
        wrapper.instance().spacePress(e)

        sandbox.assert.notCalled(Timer.prototype.pauseTimer)
        sandbox.assert.calledOnce(Timer.prototype.stopAlarm)
        sandbox.assert.notCalled(Timer.prototype.startTimer)
      })
    })

    describe('If space is pressed while neither the timer or the alarm is on', () => {
      it('Starts the timer', () => {
        const e = { keyCode: 32 }
        const wrapper = shallow(<Timer />)

        wrapper.instance().spacePress(e)

        sandbox.assert.notCalled(Timer.prototype.pauseTimer)
        sandbox.assert.notCalled(Timer.prototype.stopAlarm)
        sandbox.assert.calledOnce(Timer.prototype.startTimer)
      })
    })
  })

  describe('componentDidMount()', () => {
    it('Adds a document keydown listener', () => {
      document.addEventListener.resetHistory()

      shallow(<Timer />)
      expect(document.addEventListener.callCount).toEqual(1)
    })
  })

  describe('componentWillUnmount()', () => {
    it('Removes the document keydown listener', () => {
      document.removeEventListener.resetHistory()

      const wrapper = shallow(<Timer />)
      wrapper.instance().componentWillUnmount()

      expect(document.removeEventListener.callCount).toEqual(1)
    })
  })

  describe('Button rendering', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('When neither the timer nor the alarm are running/playing', () => {
      it('Renders only the start button and the clear input button', () => {
        const wrapper = shallow(<Timer />)
        
        expect(wrapper.exists('.start-button')).toEqual(true)
        expect(wrapper.exists('.clear-button')).toEqual(true)

        expect(wrapper.exists('.pause-button')).toEqual(false)
        expect(wrapper.exists('.stop-button')).toEqual(false)
      })
    })

    describe('When the timer is counting down', () => {
      it('Renders only the pause button', () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: true, alarmPlaying: false })

        expect(wrapper.exists('.pause-button')).toEqual(true)
        
        expect(wrapper.exists('.start-button')).toEqual(false)
        expect(wrapper.exists('.clear-button')).toEqual(false)
        expect(wrapper.exists('.stop-button')).toEqual(false)
      })
    })

    describe('When the alarm is playing', () => {
      it('Renders only the stop alarm button', () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: true, alarmPlaying: true })

        expect(wrapper.exists('.stop-button')).toEqual(true)
        
        expect(wrapper.exists('.pause-button')).toEqual(false)
        expect(wrapper.exists('.start-button')).toEqual(false)
        expect(wrapper.exists('.clear-button')).toEqual(false)
      })
    })
  })

  describe('Timer instructions', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('When the timer is stopped', () => {
      it('Shows the instructions', () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: false })

        expect(wrapper.find('.timer-instructions').hasClass('hide')).toEqual(false)
        expect(wrapper.find('.timer-instructions').prop('aria-hidden')).toEqual(false)
      })
    })

    describe('When the timer is running', () => {
      it("Doesn't show the instructions", () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: true })

        expect(wrapper.find('.timer-instructions').hasClass('hide')).toEqual(true)
        expect(wrapper.find('.timer-instructions').prop('aria-hidden')).toEqual(true)
      })
    })

    describe('When the alarm is playing', () => {
      it("Doesn't show the instructions", () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: false, alarmPlaying: true })

        expect(wrapper.find('.timer-instructions').hasClass('hide')).toEqual(true)
        expect(wrapper.find('.timer-instructions').prop('aria-hidden')).toEqual(true)
      })
    })
  })

  describe('Time input field', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Timer.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('When the timer is running, or the alarm is playing', () => {
      it('Disables the time input field', () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: false, alarmPlaying: true })

        expect(wrapper.find(InputMask).prop('disabled')).toEqual(true)
      })
    })

    describe('When the timer is running', () => {
      it('Adds an aria-live attribute to the time input', () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ countingDown: true })
        expect(wrapper.find(InputMask).prop('aria-live')).toEqual('polite')
      })
    })

    describe('When the alarm is playing', () => {
      it('Adds an alarm-playing class to the time input field', () => {
        const wrapper = shallow(<Timer />)
        wrapper.setState({ alarmPlaying: true })
        expect(wrapper.find(InputMask).hasClass('alarm-playing')).toEqual(true)
      })
    })
  })
})
