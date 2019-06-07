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
      sandbox.stub(Date, 'now').returns(new Date("2019-01-01T06:30:00.000Z"))
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Sets the running state to true', () => {
      const wrapper = shallow(<Stopwatch />)
      wrapper.instance().startStopwatch()
      expect(wrapper.state().running).toEqual(true)
    })

    describe('If the stopwatch is starting fresh', () => {
      it('Sets the startTime to the current time', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.instance().startStopwatch()

        expect(wrapper.state().startTime).toEqual(new Date("2019-01-01T06:30:00.000Z"))
      })
    })

    describe('If the stopwatch was paused and is resuming', () => {
      it('Sets startTime so that the stopwatch can resume correctly', () => {
        const wrapper = shallow(<Stopwatch />)

        wrapper.setState({ startTime: new Date("2019-01-01T06:20:00.000Z"), time: 1000 })
        wrapper.instance().startStopwatch()

        expect(wrapper.state().startTime).toEqual(new Date("2019-01-01T06:29:59.000Z"))
      })
    })
  })

  describe('countUp()', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
      sandbox.stub(Date, 'now').returns(new Date("2019-01-01T06:30:00.000Z"))
    })

    afterAll(() => {
      sandbox.restore()
    })

    it('Waits 10 ms, then updates the elapsed time', () => {
      const wrapper = shallow(<Stopwatch />)

      wrapper.setState({
        ...wrapper.state(),
        startTime: new Date("2019-01-01T06:29:00.000Z")
      })

      wrapper.instance().countUp()

      jest.runAllTimers()

      expect(wrapper.state().time).toEqual(60000)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10)
      expect(wrapper.instance().timer).not.toEqual(null)
    })
  })

  describe('createDisplayTime()', () => {
    it('Takes the current elapsed time and creates a display time', () => {
      const wrapper = shallow(<Stopwatch />)

      wrapper.setState({ time: 36000 })
      expect(wrapper.instance().createDisplayTime()).toEqual("00:00:36")

      wrapper.setState({ time: 120000 })
      expect(wrapper.instance().createDisplayTime()).toEqual("00:02:00")

      wrapper.setState({ time: 5160000 })
      expect(wrapper.instance().createDisplayTime()).toEqual("01:26:00")
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

    it('Sets the running state to false and clears any current timeouts', () => {
      const wrapper = shallow(<Stopwatch />)
      wrapper.setState({ running: true })
      wrapper.instance().stopStopwatch()
      expect(wrapper.state().running).toEqual(false)
      expect(clearTimeout).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearStopwatch()', () => {
    it('Clears the startTime and the elapsed time', () => {
      const wrapper = shallow(<Stopwatch />)
      wrapper.setState({
        time: 1000,
        startTime: Date.now()
      })

      wrapper.instance().clearStopwatch()

      expect(wrapper.state().startTime).toEqual(null)
      expect(wrapper.state().time).toEqual(0)
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

    describe('If the stopwatch is running', () => {
      it('Continues counting up', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ running: true })
        wrapper.instance().componentDidUpdate()
        expect(wrapper.instance().countUp.called).toEqual(true)
      })
    })

    describe('If the stopwatch is stopped', () => {
      it('Does nothing', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ running: false })
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

    describe('When a key other than space is pressed', () => {
      it('Does nothing', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.instance().keyPress({ keyCode: 1 })

        sandbox.assert.notCalled(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.notCalled(Stopwatch.prototype.startStopwatch)
      })
    })

    describe('When space is pressed while the stopwatch is stopped', () => {
      it('Starts the stopwatch', () => {
        const wrapper = shallow(<Stopwatch />)

        wrapper.instance().keyPress({ keyCode: 32 })
        sandbox.assert.notCalled(Stopwatch.prototype.stopStopwatch)
        sandbox.assert.calledOnce(Stopwatch.prototype.startStopwatch)
      })
    })

    describe('When space is pressed while the stopwatch is running', () => {
      it('Stops the stopwatch', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ running: true })

        wrapper.instance().keyPress({ keyCode: 32 })
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

        expect(wrapper.exists('.start-button')).toEqual(true)
        expect(wrapper.exists('.clear-button')).toEqual(true)
        expect(wrapper.exists('.pause-button')).toEqual(false)
      })
    })

    describe('When the stopwatch is running', () => {
      it('Renders the pause button only', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ running: true })

        expect(wrapper.exists('.start-button')).toEqual(false)
        expect(wrapper.exists('.clear-button')).toEqual(false)
        expect(wrapper.exists('.pause-button')).toEqual(true)
      })
    })
  })

  describe('Clock aria attributes', () => {
    beforeAll(() => {
      sandbox = sinon.createSandbox()
      sandbox.stub(Stopwatch.prototype, 'componentDidUpdate')
    })

    afterAll(() => {
      sandbox.restore()
    })

    describe('When the stopwatch is running', () => {
      it('Sets the aria-live attribute to polite', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ running: true })

        expect(wrapper.find('#stopwatch-time').prop('aria-live')).toEqual('polite')
      })
    })

    describe("When the stopwatch isn't running", () => {
      it('Sets the aria-live attribute to off', () => {
        const wrapper = shallow(<Stopwatch />)
        wrapper.setState({ running: false })

        expect(wrapper.find('#stopwatch-time').prop('aria-live')).toEqual('off')
      })
    })
  })
})
