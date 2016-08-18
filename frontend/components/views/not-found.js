import React, {Component} from 'react';
import {connect} from 'react-redux';

import {setTitle, setButtons} from '@jeny/actions/view';

class NotFound extends Component {
    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(setTitle('Not Found'));
        dispatch(setButtons([]));
    }

    render() {
        return (
            <div className="not-found">
                <h1 className="title">Not Found</h1>
                <p>{'It looks like this page doesn\'t exist.'}</p>
            </div>
        );
    }
}

export default connect()(NotFound);
