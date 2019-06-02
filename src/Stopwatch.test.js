import React from 'react'
import {Stopwatch} from './Stopwatch'
import {shallow} from 'enzyme'
import sinon from 'sinon'

let sandbox

document.addEventListener = sinon.spy()
document.removeEventListener = sinon.spy()

jest.useFakeTimers()

describe('Stopwatch', () => {
  it('Renders without error', () => {
    try {
      shallow(<Stopwatch />)
    } catch (error) {
      console.log(error)
      fail(`Rendering Stopwatch threw the error: ${error.message}`)
    }
  })

  describe('startStopwatch()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Sets the countingUp state to true', () => {
      const wrapper = shallow(<Stopwatch />)
      wrapper.instance().startStopwatch()
      expect(wrapper.state().countingUp).toEqual(true)
    })
  })

  describe('countUp()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
      sandbox.stub(Stopwatch.prototype, 'createDisplayTime').returns("00:00:01")
    })

    afterEach(() => {
      sandbox.resetHistory()
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('If the stopwatch is currently counting up', () => {
      it('Waits a second, then increments the time', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ ...wrapper.state(), countingUp: true })

        wrapper.instance().countUp()

        jest.runAllTimers()

        expect(wrapper.state().timeInSeconds).toEqual(1)
        expect(wrapper.state().displayTime).toEqual("00:00:01")
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
      })
    })

    describe('If the stopwatch is not currently counting up (because it has been paused, etc.)', () => {
      it('Does not increment the time at the end of the second', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ countingUp: false })

        wrapper.instance().countUp()

        jest.runAllTimers()

        expect(wrapper.state().timeInSeconds).toEqual(0)
        expect(wrapper.state().displayTime).toEqual("00:00:00")
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
      })
    })
  })

  describe('createDisplayTime()', () => {
    it('Takes the new time in seconds and returns a display time', () => {
      const wrapper = shallow(<Stopwatch />)

      expect(wrapper.instance().createDisplayTime(3600)).toEqual("01:00:00")
      expect(wrapper.instance().createDisplayTime(119)).toEqual("00:01:59")
      expect(wrapper.instance().createDisplayTime(215999)).toEqual("59:59:59")
      expect(wrapper.instance().createDisplayTime(1)).toEqual("00:00:01")
    })
  })

  describe('stopStopwatch()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Sets the countingUp state to false', () => {
      const wrapper = shallow(<Stopwatch />)
      wrapper.setState({ countingUp: true })
      wrapper.instance().stopStopwatch()
      expect(wrapper.state().countingUp).toEqual(false)
    })
  })

  describe('clearStopwatch()', () => {
    it('Sets the stored time back to 0', () => {
      const wrapper = shallow(<Stopwatch />)
      wrapper.setState({
        timeInSeconds: 10,
        displayTime: "01:01:01"
      })

      wrapper.instance().clearStopwatch()

      expect(wrapper.state().timeInSeconds).toEqual(0)
      expect(wrapper.state().displayTime).toEqual("00:00:00")
    })
  })

  describe('componentDidUpdate()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'countUp')
    })

    afterEach(() => {
      sandbox.resetHistory()
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('If the stopwatch is counting up', () => {
      it('Continues counting up', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ countingUp: true })
        wrapper.instance().componentDidUpdate()
        expect(wrapper.instance().countUp.called).toEqual(true)
      })
    })

    describe('If the stopwatch is stopped', () => {
      it('Does nothing', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ countingUp: false })
        wrapper.instance().componentDidUpdate()
        expect(wrapper.instance().countUp.called).toEqual(false)
      })
    })
  })

  describe('keyPress()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'stopStopwatch')
      sandbox.stub(Stopwatch.prototype, 'startStopwatch')
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
    })

    afterEach(() => {
      sandbox.resetHistory()
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('When a key other than space or enter is pressed', () => {
      it('Does nothing', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.instance().keyPress({ keyCode: 1 })

        sandbox.assert.notCalled(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.notCalled(Stopwatch.prototype.startStopwatch)
      })
    })

    describe('When space or enter is pressed while the stopwatch is stopped', () => {
      it('Starts the stopwatch', () => {
        const wrapper = shallow(<Stopwatch />)

        wrapper.instance().keyPress({ keyCode: 32 })
        sandbox.assert.notCalled(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.calledOnce(Stopwatch.prototype.startStopwatch)

        sandbox.resetHistory()

        wrapper.instance().keyPress({ keyCode: 13 })
        sandbox.assert.notCalled(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.calledOnce(Stopwatch.prototype.startStopwatch)
      })
    })

    describe('When space or enter is pressed while the stopwatch is running', () => {
      it('Stops the stopwatch', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ countingUp: true })

        wrapper.instance().keyPress({ keyCode: 32 })
        sandbox.assert.calledOnce(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.notCalled(Stopwatch.prototype.startStopwatch)

        sandbox.resetHistory()

        wrapper.instance().keyPress({ keyCode: 13 })
        sandbox.assert.calledOnce(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.notCalled(Stopwatch.prototype.startStopwatch)
      })
    })
  })

  describe('componentDidMount()', () => {
    it('Adds a keydown listener to the document', () => {
      document.addEventListener.resetHistory()
      shallow(<Stopwatch />)

      expect(document.addEventListener.called).toEqual(true)
    })
  })

  describe('componentWillUnmount()', () => {
    it('Removes the keydown listener to the document', () => {
      document.removeEventListener.resetHistory()
      const wrapper = shallow(<Stopwatch />)
      wrapper.instance().componentWillUnmount()

      expect(document.removeEventListener.called).toEqual(true)
    })
  })

  describe('Button rendering', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('When the stopwatch is stopped', () => {
      it('Renders only the start button and the clear button', () => {
        const wrapper = shallow(<Stopwatch />)

        expect(wrapper.exists('.startButton')).toEqual(true)
        expect(wrapper.exists('.clearButton')).toEqual(true)
        expect(wrapper.exists('.pauseButton')).toEqual(false)
      })
    })

    describe('When the stopwatch is running', () => {
      it('Renders the pause button only', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ countingUp: true })

        expect(wrapper.exists('.startButton')).toEqual(false)
        expect(wrapper.exists('.clearButton')).toEqual(false)
        expect(wrapper.exists('.pauseButton')).toEqual(true)
      })
    })
  })
})
