import * as lib from './lib.js';

const { Sprite } = lib;

class Stage extends React.Component {
  constructor(props) {
    super(props);

    this.buttonPositions = [
      0,
      0,
      175,
      75,
      600 - 145,
      75,
      600 / 2 - 20,
      400 / 2 + 10,
      175,
      400 - 75,
      600 - 115,
      400 - 95,
    ];

    this.state = {
      buttons: [1, 2, 3, 4, 5],
      touchButton: -1,
    };
  }

  render() {
    return (
      <>
        <Sprite texture={this.props.resources.background.texture} />
        {this.state.buttons.map((i) => {
          const touchdown = () => {
            this.setState({ touchButton: i });
          };

          const touchend = () => {
            const buttons = this.state.buttons.concat();
            const index = buttons.indexOf(i);
            buttons.splice(index, 1);
            this.setState({
              touchButton: -1,
              buttons,
            });
          };

          return (
            <Sprite
              key={i}
              onTouchStart={touchdown}
              onMouseDown={touchdown}
              onMouseUp={touchend}
              onTouchEnd={touchend}
              texture={
                this.state.touchButton === i
                  ? this.props.resources.buttonDown.texture
                  : this.props.resources.button.texture
              }
              anchorX={0.5}
              anchorY={0.5}
              interactive
              x={this.buttonPositions[i * 2]}
              y={this.buttonPositions[i * 2 + 1]}
            />
          );
        })}
      </>
    );
  }
}

class Demo extends React.Component {
  saveRoot = (root) => {
    this.root = root;
  };

  componentDidMount() {
    const app = new PIXI.Application({
      width: 620,
      height: 400,
    });
    this.root.appendChild(app.view);

    window.app = app;

    app.loader
      .add('background', './button_test_BG.jpeg')
      .add('button', './button.png')
      .add('buttonDown', './buttonDown.png')
      .load((loader, resources) => {
        lib.render(<Stage resources={resources} />, app.stage);
      });
  }

  render() {
    return <div ref={this.saveRoot} />;
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'));
