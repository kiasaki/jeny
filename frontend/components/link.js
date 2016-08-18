import React, {PropTypes} from 'react';

import {navigate} from '@jeny/utils/routing';

function Link({to, children, className}) {
    function onClick(event) {
        event.stopPropagation();

        if (!event.metaKey) {
            event.preventDefault();
            navigate(to);
        }
    }

    return (
        <a href={to} onClick={onClick} className={className}>
            {children}
        </a>
    );
}

Link.propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired
};

export default Link;
