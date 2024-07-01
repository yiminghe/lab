export const emptyText = '\uFEFF';

export const cursorStyle = {
  position: 'absolute',
  width: '2px',
  backgroundColor: 'black',
  zIndex: 10,
  opacity: 0,
  userSelect: 'none',
};

export const textAreaStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px',
  fontSize: 'inherit',
  lineHeight: 1,
  padding: '0px',
  border: 'none',
  whiteSpace: 'nowrap',
  width: '10em',
  zIndex: -1,
  opacity: 0,
};

export const selectionOverlayStyle = {
  position: 'absolute',
  zIndex: 20,
  userSelect: 'none',
};

export const activeOverlayStyle = {
  backgroundColor: '#76a7fa',
  opacity: 0.5,
};

export const inActiveOverlayStyle = {
  backgroundColor: 'rgb(0, 0, 0)',
  opacity: 0.15,
};
