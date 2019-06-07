import React from "react";
import { Stopwatch } from "./Stopwatch";
import { Timer } from "./Timer";
import "./App.css";
import classNames from "classnames";
import { Container, Row, Col } from "react-bootstrap";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: "timer"
    };
  }

  render() {
    const selected = this.state.selected;

    return (
      <Container className="App" fluid>
        <Row className="pt-5">
          <Col xs={10} md={5} className="tabs p-3 m-auto">
            <Row className="switcher justify-content-center">
              <button
                className={classNames("selector timer-selector", {
                  active: selected === "timer"
                })}
                onClick={() => this.setState({ selected: "timer" })}
                disabled={selected === "timer"}
              >
                Timer
              </button>
              <button
                className={classNames("selector stopwatch-selector", {
                  active: selected === "stopwatch"
                })}
                onClick={() => this.setState({ selected: "stopwatch" })}
                disabled={selected === "stopwatch"}
              >
                Stopwatch
              </button>
            </Row>
            <Row className="clocks justify-content-center">
              {selected === "timer" && <Timer />}
              {selected === "stopwatch" && <Stopwatch />}
            </Row>
          </Col>
        </Row>
        <footer>
          <div className="tip">you can also press space to start/stop</div>
          <div className="links-and-credits">
            <a
              href="https://github.com/christinesn/timer-and-stopwatch"
              title="View source on github"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
            </a>
            &nbsp;&nbsp;✨ alarm mp3 from
            <a
              href="http://www.orangefreesounds.com/wecker-sound/"
              target="_blank"
              rel="noopener noreferrer"
            >
              orange free sounds
            </a>
          </div>
        </footer>
      </Container>
    );
  }
}

export default App;
