import React, {Component} from 'react';
import {connect} from 'react-redux';
import {find, propEq} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {setTitle, setButtons} from '@jeny/actions/view';
import {applicationsList} from '@jeny/actions/api';

class Servers extends Component {
    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(setTitle('Applications'));
        dispatch(setButtons([
            {link: '/applications', label: 'Applications', active: true}
        ]));

        dispatch(applicationsList());
    }

    render() {
        const {applicationsRequest} = this.props;

        if (!applicationsRequest || applicationsRequest.status === REQUEST) {
            return (
                <p className="text--center">Loading...</p>
            );
        }

        if (applicationsRequest.status === FAILURE) {
            return (
                <p className="text--center text--red">Error fetching applications.</p>
            );
        }

        return (
            <div>asd</div>
        );
    }
}

function mapStateToProps(state) {
    return {
        applicationsRequest: state.api.applications.list
    };
}

export default connect(mapStateToProps)(Servers);
