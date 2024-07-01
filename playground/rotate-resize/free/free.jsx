import styleSheet from './free.css';
import rotateResize, {
  angleDegrees,
  lineDegrees,
  computeEndPoints,
  pointsDistance,
  centerPoint,
} from '../rotateResize.js';

document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

const handlers = ['rotate', 'lt', 'ct', 'rt', 'lm', 'rm', 'lb', 'cb', 'rb'];

class Rect extends React.Component {
  constructor() {
    super();
    this.state = {
      adjustType: null,
      isAdjusting: false,
      fixedRatio: false,
    };
  }

  bounds() {
    return computeEndPoints(this.props.rect);
  }

  showRotateGuide() {
    return this.state.adjustType === 'rotate';
  }

  rotateGuideStyle() {
    if (!this.showRotateGuide()) {
      return {};
    }
    const { center, lt, rb } = this.bounds();
    const { x, y } = center;
    const w = pointsDistance(lt, rb);
    return {
      left: `${x - w / 2}px`,
      top: `${y - w / 2}px`,
      width: `${w}px`,
      height: `${w}px`,
    };
  }

  showResizeGuide() {
    return (
      this.state.fixedRatio &&
      this.state.adjustType &&
      this.state.adjustType !== 'rotate'
    );
  }

  resizeGuideStyle() {
    if (!this.showResizeGuide()) {
      return {};
    }
    let p0, p1;
    const t = this.state.adjustType;
    const e = this.bounds();
    if (t === 'lt' || t === 'rb') {
      [p0, p1] = [e.lt, e.rb];
    } else if (t === 'rt' || t === 'lb') {
      [p0, p1] = [e.rt, e.lb];
    } else if (t === 'cb' || t === 'ct') {
      [p0, p1] = [e.cb, e.ct];
    } else {
      [p0, p1] = [e.lm, e.rm];
    }
    const height = 10000;
    const center = centerPoint(p0, p1);
    const r = lineDegrees(p0, p1);
    return {
      left: `${center.x}px`,
      top: `${center.y - height / 2}px`,
      height: `${height}px`,
      transform: `rotate(${r}deg)`,
    };
  }

  internalStyle() {
    const { x, y, w, h, r } = this.props.rect;
    const rad = (Math.PI / 180) * r;
    const a = Math.cos(rad);
    const c = -Math.sin(rad);
    const b = -c;
    const d = a;
    return {
      width: `${w}px`,
      height: `${h}px`,
      transform: ` matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})`,
    };
  }

  showHandlers() {
    if (this.state.isAdjusting && this.state.adjustType === 'move') {
      return false;
    }
    return true;
  }

  computeMousePosition(e) {
    const { pageX, pageY } = e;
    return {
      x: pageX,
      y: pageY,
    };
  }

  onMouseDown = (e, type) => {
    e.stopPropagation();
    this.mouseStart = this.computeMousePosition(e);
    this.rectStart = { ...this.props.rect };
    this.setState({
      fixedRatio: e.shiftKey,
      adjustType: e.metaKey ? 'rotate' : type,
    });

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = (e) => {
    this.mouseEnd = this.computeMousePosition(e);
    const [x, y] = ['x', 'y'].map((t) =>
      Math.abs(this.mouseEnd[t] - this.mouseStart[t]),
    );
    if (x > 2 || y > 2) {
      this.setState({ isAdjusting: true });
      this.setDocumentCursor(this.mouseEnd);
      const rectEnd = rotateResize(
        this.state.adjustType,
        this.mouseStart,
        this.mouseEnd,
        this.rectStart,
        this.state.fixedRatio,
      );
      this.props.onTransformed(rectEnd);
    }
  };

  onMouseUp = () => {
    this.setState({ adjustType: null });
    this.setBodyCursor('auto');
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  setBodyCursor(cursor) {
    document.body.style.cursor = cursor;
  }

  setDocumentCursor(point, tolerate = true) {
    if (this.state.adjustType === 'move') {
      return this.setBodyCursor('move');
    }
    if (this.state.adjustType === 'rotate') {
      return this.setBodyCursor('-webkit-grab');
    }
    const { center } = this.bounds();
    const vector = {
      x: (point.x || 0) - center.x,
      y: (point.y || 0) - center.y,
    };
    const degrees = angleDegrees(vector);
    const toleratance = tolerate ? 10 : 0;

    switch (true) {
      case degrees <= -180 + toleratance:
        return this.setBodyCursor('ew-resize');
      case degrees < -90 - toleratance:
        return this.setBodyCursor('nwse-resize');
      case degrees <= -90 + toleratance:
        return this.setBodyCursor('ns-resize');
      case degrees < 0 - toleratance:
        return this.setBodyCursor('nesw-resize');
      case degrees <= 0 + toleratance:
        return this.setBodyCursor('ew-resize');
      case degrees < 90 - toleratance:
        return this.setBodyCursor('nwse-resize');
      case degrees <= 90 + toleratance:
        return this.setBodyCursor('ns-resize');
      case degrees < 180 - toleratance:
        return this.setBodyCursor('nesw-resize');
      case degrees <= 180 + toleratance:
        return this.setBodyCursor('ew-resize');
    }
  }

  preventDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  componentDidMount() {
    document.addEventListener('drag', this.preventDrag);
    document.addEventListener('dragstart', this.preventDrag);
  }

  componentWillUnmount() {
    document.removeEventListener('drag', this.preventDrag);
    document.removeEventListener('dragstart', this.preventDrag);
  }

  render() {
    return (
      <div className="controller">
        <div
          className="absolute internal"
          style={this.internalStyle()}
          onMouseDown={($event) => this.onMouseDown($event, 'move')}>
          {(this.showHandlers() &&
            handlers.map((handler) => (
              <i
                key={handler}
                className={
                  'handler absolute ' +
                  (handler === 'rotate' ? handler : handler.split('').join(' '))
                }
                onMouseDown={($event) => this.onMouseDown($event, handler)}></i>
            ))) ||
            null}
        </div>
        {this.showResizeGuide() && (
          <div
            className="absolute resize-guide"
            style={this.resizeGuideStyle()}></div>
        )}
        {this.showRotateGuide() && (
          <div
            className="absolute rotate-guide"
            style={this.rotateGuideStyle()}></div>
        )}
      </div>
    );
  }
}

const App = () => {
  const [rect, setRect] = React.useState({
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    r: 0,
  });

  return <Rect rect={rect} onTransformed={setRect} />;
};

ReactDOM.render(<App />, document.getElementById('root'));
