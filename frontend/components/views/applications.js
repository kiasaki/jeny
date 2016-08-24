import React, {Component} from 'react';
import {connect} from 'react-redux';
import {find, propEq, values} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {setTitle, setButtons} from '@jeny/actions/view';
import {fetchAll} from '@jeny/actions/application';
import Link from '@jeny/components/link';

class Applications extends Component {
    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(setTitle('Applications'));
        dispatch(setButtons([
            {link: '/applications', label: 'Applications', active: true}
        ]));

        dispatch(fetchAll());
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

        if (applicationsRequest.content.results.length === 0) {
            return (
                <p className="text--center">You have 0 applications configured</p>
            );
        }

        return (
            <div className="applications">
                {applicationsRequest.content.results.map(application => (
                    <Link
                        className="application-card"
                        key={application.id}
                        to={'/applications/' + application.id}
                    >
                        <header>{application.id}</header>
                    </Link>
                ))}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        applicationsRequest: state.api.applications.list
    };
}

export default connect(mapStateToProps)(Applications);
