import React, {  memo } from 'react';
import cx from 'classnames';

import { inInputDOMNode } from '../../utils';
import store from '../../store/index.ts';

export default EdgeComponent => {
  const EdgeWrapper = memo((props) => {
    const {
      id, source, target, type,
      animated, selected, onClick
    } = props;
    const edgeClasses = cx('react-flow__edge', { selected, animated });
    const onEdgeClick = (evt) => {
      if (inInputDOMNode(evt)) {
        return false;
      }

      store.dispatch.setSelectedElements({ id, source, target });
      onClick({ id, source, target, type });
    };

    return (
      <g
        className={edgeClasses}
        onClick={onEdgeClick}
      >
        <EdgeComponent {...props} />
      </g>
    );
  });

  EdgeWrapper.displayName = 'EdgeWrapper';
  EdgeWrapper.whyDidYouRender = false;

  return EdgeWrapper;
};
