import React, {Component} from 'react';
import {connect} from 'react-redux';
import {map, head, find, propEq, values} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {setTitle, setButtons} from '@jeny/actions/view';
import {fetchAll} from '@jeny/actions/application';
import {navigate} from '@jeny/utils/routing';
import Link from '@jeny/components/link';
import Tabs from '@jeny/components/tabs';
import Environment from '@jeny/components/application/environment';

class Application extends Component {
    constructor(props) {
        super(props);

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

        dispatch(fetchAll(id));
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.params.environmentId && nextProps.application) {
            const applicationId = this.props.params.id;
            const environmentId = head(nextProps.application.environments).id;
            navigate(`/applications/${applicationId}/${environmentId}`);
        }
    }

    onTabSelect(selectedEnvironment) {
        const applicationId = this.props.params.id;
        const environmentId = selectedEnvironment.id;
        navigate(`/applications/${applicationId}/${environmentId}`);
    }

    renderCurrentEnvironment() {
        const {params, application} = this.props;
        const {id, environmentId, deploymentId} = params;

        if (!environmentId) {
            return (
                <p className="text--center">
                    Loading environments...
                </p>
            );
        }

        return (
            <Environment
                application={application}
                applicationId={id}
                environmentId={environmentId}
                deploymentId={deploymentId}
            />
        );
    }

    render() {
        const {application, params} = this.props;

        if (!application) {
            return <p className="text--center">Loading...</p>;
        }

        const environments = values(application.environments);

        if (!environments || environments.length === 0) {
            return (
                <p className="text--center">
                    This application has no environment configured!
                </p>
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
                        selectedItem={params.environmentId}
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
        application: state.application[id]
    };
}

export default connect(mapStateToProps)(Application);
