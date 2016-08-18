import React, {Component} from 'react';
import {connect} from 'react-redux';

import {setTitle, setButtons} from '@jeny/actions/view';

class Home extends Component {
    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(setTitle('Dashboard'));
        dispatch(setButtons([
            {link: '/', label: 'General', active: true},
            {link: '/d/lb', label: 'Load banlancer heath'},
            {link: '/d/rl', label: 'Request load'},
            {link: '/d/db', label: 'Database'}
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
