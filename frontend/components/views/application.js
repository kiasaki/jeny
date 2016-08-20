import React, {Component} from 'react';
import {connect} from 'react-redux';
import {map, head, find, propEq} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {setTitle, setButtons} from '@jeny/actions/view';
import {applicationsGet, environmentsList} from '@jeny/actions/api';
import Link from '@jeny/components/link';
import Tabs from '@jeny/components/tabs';

class Application extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedEnvironment: null
        };

        this.onTabSelect = this.onTabSelect.bind(this);
    }

    componentWillMount() {
        const {dispatch, params} = this.props;
        const {id} = params;


        dispatch(setTitle('Applications: ' + id));
        dispatch(setButtons([
            {link: '/applications/' + id, label: 'Deployments', active: true},
            //{link: '/applications/' + id + '#config', label: 'Configuration'}
        ]));

        dispatch(applicationsGet(id));
        dispatch(environmentsList(id));
    }

    componentWillReceiveProps(nextProps) {
        if (
            !this.state.selectedEnvironment &&
            nextProps.environmentsRequest.status === SUCCESS &&
            nextProps.environmentsRequest.content.results.length > 0
        ) {
            const environments = nextProps.environmentsRequest.content.results;
            this.setState({selectedEnvironment: head(environments).id});
        }
    }

    onTabSelect(selectedEnvironment) {
        this.setState({selectedEnvironment: selectedEnvironment.id});
    }

    renderCurrentEnvironment() {
        return (
            <div>{this.state.selectedEnvironment}</div>
        );
    }

    render() {
        const {applicationRequest, environmentsRequest} = this.props;

        if (
            !applicationRequest || applicationRequest.status === REQUEST ||
            !environmentsRequest || environmentsRequest.status === REQUEST
        ) {
            return (
                <p className="text--center">Loading...</p>
            );
        }

        if (
            applicationRequest.status === FAILURE ||
            environmentsRequest.status === FAILURE
        ) {
            return (
                <p className="text--center text--red">Error fetching application.</p>
            );
        }

        const environments = environmentsRequest.content.results;

        if (environments.length === 0) {
            return (
                <p className="text--center">This application has no environment configured!</p>
            );
        }

        const tabItems = map(environment => ({
            id: environment.id,
            name: environment.id
        }), environments);

        return (
            <div className="application">
                <div className="tabs__container">
                    <Tabs
                        items={tabItems}
                        selectedItem={this.state.selectedEnvironment}
                        onSelect={this.onTabSelect}
                    />
                    <div className="tabs__content">
                        {this.renderCurrentEnvironment()}
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const id = ownProps.params.id;

    return {
        applicationRequest: state.api.applications.get[id],
        environmentsRequest: state.api.environments.list[id]
    };
}

export default connect(mapStateToProps)(Application);
