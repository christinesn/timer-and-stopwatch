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

  describe('Timer and stopwatch switching', () => {
    describe('When the timer button is clicked', () => {
      it('Switches to the timer component', () => {
        const wrapper = shallow(<App />)
        wrapper.setState({ selected: 'stopwatch '})
        wrapper.find('.timer-selector').simulate('click')

        expect(wrapper.state().selected).toEqual('timer')

        expect(wrapper.find('.timer-selector').prop('disabled')).toEqual(true)
        expect(wrapper.find('.timer-selector').hasClass('active')).toEqual(true)
        expect(wrapper.find('.stopwatch-selector').prop('disabled')).toEqual(false)
        expect(wrapper.find('.stopwatch-selector').hasClass('active')).toEqual(false)

        expect(wrapper.exists(Timer)).toEqual(true)
        expect(wrapper.exists(Stopwatch)).toEqual(false)
      })
    })

    describe('When the stopwatch button is clicked', () => {
      it('Switches to the stopwatch component', () => {
        const wrapper = shallow(<App />)
        wrapper.setState({ selected: 'timer '})
        wrapper.find('.stopwatch-selector').simulate('click')

        expect(wrapper.state().selected).toEqual('stopwatch')

        expect(wrapper.find('.timer-selector').prop('disabled')).toEqual(false)
        expect(wrapper.find('.timer-selector').hasClass('active')).toEqual(false)
        expect(wrapper.find('.stopwatch-selector').prop('disabled')).toEqual(true)
        expect(wrapper.find('.stopwatch-selector').hasClass('active')).toEqual(true)

        expect(wrapper.exists(Timer)).toEqual(false)
        expect(wrapper.exists(Stopwatch)).toEqual(true)
      })
    })
  })
})
