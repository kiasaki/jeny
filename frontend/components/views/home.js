import React, {Component} from 'react';
import {connect} from 'react-redux';

import {setTitle, setButtons} from '@jeny/actions/view';

class Home extends Component {
    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(setTitle('Dashboard'));
        dispatch(setButtons([
            {link: '/', label: 'Overview', active: true},
            {link: '/dashboard/1', label: 'Stability'},
            {link: '/dashboard/2', label: 'Availability'},
            {link: '/dashboard/3', label: 'Performance'}
        ]));
    }

    render() {
        return (
            <div className="home">
                <p className="text--center">...</p>
            </div>
        );
    }
}

export default connect()(Home);
