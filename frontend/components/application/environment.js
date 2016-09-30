import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import {map, find, propEq, addIndex, splitEvery, keys} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {navigate} from '@jeny/utils/routing';
import {classNames} from '@jeny/utils';
import {
    deploymentsList, deploymentsGet, deploymentsLog, gitRef
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
            application, environment,
            deploymentsRequest, deploymentRequest, deploymentLogRequest, gitRefRequests
        } = nextProps;

        if (!deploymentsRequest) {
            dispatch(deploymentsList());
        }
        if (deploymentId && deploymentId !== 'new' && !deploymentRequest) {
            dispatch(deploymentsGet(deploymentId));
        }
        if (deploymentId && deploymentId !== 'new' && !deploymentLogRequest) {
            dispatch(deploymentsLog(deploymentId));
        }

        const lastDeployBranch = application.githubRepo + ':heads/' + environment.deployedBranch;
        if (environment && !gitRefRequests[lastDeployBranch]) {
            dispatch(gitRef(lastDeployBranch));
        }
        const defaultBranch = environment.defaultBranch;
        const defaultBranchRef = application.githubRepo + ':heads/' + defaultBranch;
        if (!gitRefRequests[defaultBranchRef]) {
            dispatch(gitRef(defaultBranchRef));
        }
    }

    onNewDeployment() {
        const {applicationId, environmentId, deploymentId} = this.props;
        navigate(`/applications/${applicationId}/${environmentId}/new`);
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
        const {dispatch, application, environment, gitRefRequests} = this.props;
        const defaultBranch = environment.defaultBranch;
        const defaultTags = keys(application.ansibleTags);

        const toDeployBranch = this.refs.newDeployBranch ? this.refs.newDeployBranch.value : defaultBranch;
        const lastDeployRefRequest = gitRefRequests[application.githubRepo + ':heads/' + environment.deployedBranch];
        const toDeployRefRequest = gitRefRequests[application.githubRepo + ':heads/' + toDeployBranch];

        const onClick = () => {
            const branch = this.refs.newDeployBranch.value;
            const tags = this.refs.newDeployTags.value;

            dispatch(deploymentsCreate({
                applicationId: application.id,
                environmentId: environment.id,
                branch: branch.id,
                tags: tags.split(',')
            }));
        };

        const onBranchUpdate = event => {
            const ref = 'heads/' + event.target.value;
            dispatch(gitRef(application.githubRepo + ':' + ref));
        };

        let compareLinkEl = <p>Loading compare link...</p>;
        if (
            lastDeployRefRequest && lastDeployRefRequest.status === FAILURE ||
            toDeployRefRequest && toDeployRefRequest.status === FAILURE
        ) {
            compareLinkEl = (
                <p className="text--red">{"Can't find the given branch in you git repository!"}</p>
            );
        }
        if (
            lastDeployRefRequest && lastDeployRefRequest.status === SUCCESS &&
            toDeployRefRequest && toDeployRefRequest.status === SUCCESS
        ) {
            const compareLinkUrl = [
                'https://github.com/', application.githubRepo, '/compare/',
                lastDeployRefRequest.content.sha, '...', toDeployRefRequest.content.sha
            ].join('');
            compareLinkEl = (
                <p>
                    <a href={compareLinkUrl} target="_blank">
                        View commits about to be deployed on GitHub
                    </a>
                </p>
            );
        }

        return (
            <div className="new-deployment form">
                <div className="form__field">
                    <label>Branch</label>
                    <input
                        type="text"
                        ref="newDeployBranch"
                        defaultValue={defaultBranch}
                        onBlur={onBranchUpdate}
                    />
                </div>

                <div className="form__field">
                    <label>Tags</label>
                    <input
                        type="text"
                        ref="newDeployTags"
                        defaultValue={defaultTags}
                    />
                </div>

                {compareLinkEl}

                <button className="btn" onClick={onClick}>
                    Deploy!
                </button>
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
        const {deploymentsRequest, deploymentId} = this.props;

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

        const newDeploymentCardClassName = classNames({
            'deployment-card': true,
            'deployment-card--new': true,
            'deployment-card--active': deploymentId === 'new'
        });

        return (
            <div className="environment">
                <div className="environment__deployments">
                    <div
                        className={newDeploymentCardClassName}
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
                    {deploymentId === 'new' ? (
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
        deploymentLogRequest: state.api.deployments.log[deploymentId],
        gitRefRequests: state.api.git.ref
    };
};

export default connect(mapStateToProps)(Environment);
