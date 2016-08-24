import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import {map, find, propEq, addIndex, splitEvery, keys} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {navigate} from '@jeny/utils/routing';
import {classNames} from '@jeny/utils';
import {
    deploymentsList, deploymentsGet, deploymentsLog
} from '@jeny/actions/api';

const JSON_DATE_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';

class Environment extends Component {
    constructor(props) {
        super(props);

        this.state = {creatingDeployment: false};

        this.onNewDeployment = this.onNewDeployment.bind(this);
    }

    componentWillMount() {
        const {dispatch} = this.props;
        dispatch(deploymentsList());
    }

    componentWillReceiveProps(nextProps) {
        const {
            dispatch,
            applicationId, environmentId, deploymentId,
            deploymentsRequest, deploymentRequest, deploymentLogRequest
        } = nextProps;

        if (!deploymentsRequest) {
            dispatch(deploymentsList());
        }
        if (deploymentId && !deploymentRequest) {
            dispatch(deploymentsGet(deploymentId));
        }
        if (deploymentId && !deploymentLogRequest) {
            dispatch(deploymentsLog(deploymentId));
        }
    }

    onNewDeployment() {
        this.setState({creatingDeployment: true});
    }

    renderDeploymentCard(deployment) {
        const {applicationId, environmentId, deploymentId} = this.props;
        const className = classNames({
            'deployment-card': true,
            'deployment-card--active': deployment.id === deploymentId
        });
        const statusClassName = `
            deployment-card__status
            deployment-card__status--${deployment.status}
            pull--right
        `;

        const onClick = () => navigate(
            `/applications/${applicationId}/${environmentId}/${deployment.id}`
        );

        return (
            <div
                className={className}
                key={deployment.id}
                onClick={onClick}
            >
                <div className="clearfix">
                    <h1 className="deployment-card__id pull--left">
                        {deployment.id}
                    </h1>
                    <div className={statusClassName}>
                        {deployment.status}
                    </div>
                </div>
                <div className="clearfix">
                    <div className="deployment-card__by pull--left">
                        {deployment.by}
                    </div>
                    <div className="deployment-card__branch pull--right">
                        {deployment.branch}
                    </div>
                </div>
            </div>
        );
    }

    renderNewDeployment() {
        const {application, environment} = this.props;
        const defaultBranch = environment.defaultBranch;
        const defaultTags = keys(application.ansibleTags);

        return (
            <div className="new-deployment form">
                <h1 className="form__title">New Deployment</h1>

                <div className="form__field">
                    <label>Branch</label>
                    <input type="text" defaultValue={defaultBranch} />
                </div>

                <div className="form__field">
                    <label>Tags</label>
                    <input type="text" defaultValue={defaultTags} />
                </div>
            </div>
        );
    }

    renderDeployment() {
        const {
            deploymentId, deploymentRequest, deploymentLogRequest, application
        } = this.props;

        if (!deploymentId) {
            return (
                <p className="text--center">
                    &larr; Select a deployment to view
                </p>
            );
        }

        if (
            !deploymentRequest || deploymentRequest.status === REQUEST ||
            !deploymentLogRequest || deploymentLogRequest.status === REQUEST
        ) {
            return (
                <p className="text--center">Loading...</p>
            );
        }

        if (
            deploymentRequest.status === FAILURE ||
            deploymentLogRequest.status === FAILURE
        ) {
            return (
                <p className="text--center text--red">
                    Error retrieving deployment.
                </p>
            );
        }

        const deployment = deploymentRequest.content;

        const statusClassName = `
            deployment__status
            deployment__status--${deployment.status}
            pull--right
        `;

        let diffUrl = `https://github.com/${application.githubRepo}/compare/`;
        diffUrl += `${deployment.previousSha}...${deployment.sha}`;

        const createdAt = moment(deployment.createdAt, JSON_DATE_FORMAT);
        const completedAtOrNow = moment(deployment.completedAt || moment().utc(), JSON_DATE_FORMAT);
        const duration = moment.duration(completedAtOrNow.diff(createdAt));

        return (
            <div className="deployment">
                <div className="clearfix">
                    <div className="deployment__id pull--left">
                        {deployment.id}
                    </div>
                    <div className={statusClassName}>
                        status: {deployment.status}
                    </div>
                </div>

                <div className="deployment__info">
                    <table className="table">
                        <tbody>
                            <tr>
                                <th className="text--right">by</th>
                                <td>{deployment.by}</td>
                                <th className="text--right">branch</th>
                                <td>{deployment.branch}</td>
                            </tr>
                            <tr>
                                <th className="text--right">tags</th>
                                <td>{deployment.tags.join(',')}</td>
                                <th className="text--right">git sha</th>
                                <td>
                                    {deployment.sha.slice(0, 8)}&nbsp;
                                    <a href={diffUrl} target="_blank">see diff</a>
                                </td>
                            </tr>
                            <tr>
                                <th className="text--right">started</th>
                                <td>{createdAt.fromNow()}</td>
                                <th className="text--right">duration</th>
                                <td>{duration.humanize()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="deployment__servers">
                    <div className="deployment__servers__heading">
                        Servers ({deployment.servers.length})
                    </div>
                    <table className="table">
                        <tbody>
                            {addIndex(map)((group, i) => (
                                <tr key={i}>
                                    {map(server => (
                                        <td key={server.id}>
                                            <strong>{server.id}</strong>&nbsp;
                                            <i>{server.privateIpAddress}</i>
                                        </td>
                                    ), group)}
                                </tr>
                            ), splitEvery(3, deployment.servers))}
                        </tbody>
                    </table>
                </div>

                <div className="deployment__log">
                    <div className="deployment__log__heading">
                        Log
                    </div>
                    <pre
                        className="deployment__log__contents"
                        children={deploymentLogRequest.content}
                    />
                </div>
            </div>
        );
    }

    render() {
        const {deploymentsRequest} = this.props;

        if (!deploymentsRequest || deploymentsRequest.status === REQUEST) {
            return (
                <p className="text--center">Loading...</p>
            );
        }

        if (deploymentsRequest.status === FAILURE) {
            return (
                <p className="text--center text--red">Error fetching deployments.</p>
            );
        }

        const deployments = deploymentsRequest.content.results;

        return (
            <div className="environment">
                <div className="environment__deployments">
                    <div
                        className="deployment-card deployment-card--new"
                        onClick={this.onNewDeployment}
                    >
                        New Deployment &rarr;
                    </div>
                    {map(this.renderDeploymentCard.bind(this), deployments)}
                    {deployments.length === 0 ? (
                        <p className="text--center">
                            No deployment in the past week.
                        </p>
                    ) : null}
                </div>
                <div className="environment__deployment">
                    {this.state.creatingDeployment ? (
                        this.renderNewDeployment()
                    ) : (
                        this.renderDeployment()
                    )}
                </div>
            </div>
        );
    }
}

Environment.propTypes = {
    applicationId: PropTypes.string.isRequired,
    environmentId: PropTypes.string.isRequired,
    deploymentId: PropTypes.string
};

function mapStateToProps(state, ownProps) {
    const {applicationId, environmentId, deploymentId} = ownProps;

    const application = state.application[applicationId];

    return {
        environment: application.environments[environmentId],
        deploymentsRequest: state.api.deployments.list,
        deploymentRequest: state.api.deployments.get[deploymentId],
        deploymentLogRequest: state.api.deployments.log[deploymentId]
    };
};

export default connect(mapStateToProps)(Environment);
