import React, { Component, PropTypes } from 'react';

export default class ProgressBar extends Component {
  progress() {
    if(this.props.progress) {
      return this.props.progress;
    } else {
      return 0;
    }
  }
  render() {
    return (
        <div className="progress">
          <div className="determinate" style={{width: this.progress() + "%"}}></div>
        </div>
    );
  }
}

ProgressBar.propType = {
  progress: PropTypes.number,
};
