import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {shallow} from 'enzyme'
import {Timer} from './Timer'
import {Stopwatch} from './Stopwatch'

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('Timer and stopwatch rendering', () => {
    describe('When the timer tab is selected', () => {
      it("Doesn't render the stopwatch component at all", () => {
        const wrapper = shallow(<App />)

        wrapper.setState({ key: 'timer' })

        expect(wrapper.exists(Timer)).toEqual(true)
        expect(wrapper.exists(Stopwatch)).toEqual(false)
      })
    })

    describe('When the stopwatch tab is selected', () => {
      it("Doesn't render the timer component at all", () => {
        const wrapper = shallow(<App />)

        wrapper.setState({ key: 'stopwatch' })

        expect(wrapper.exists(Timer)).toEqual(false)
        expect(wrapper.exists(Stopwatch)).toEqual(true)
      })
    })
  })
})
