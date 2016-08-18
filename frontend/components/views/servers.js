import React, {Component} from 'react';
import {connect} from 'react-redux';
import {find, propEq} from 'ramda';

import {REQUEST, SUCCESS, FAILURE} from '@jeny/constants/api';
import {setTitle, setButtons} from '@jeny/actions/view';
import {serversList} from '@jeny/actions/api';

class Servers extends Component {
    componentWillMount() {
        const {dispatch} = this.props;

        dispatch(setTitle('Servers'));
        dispatch(setButtons([
            {link: '/servers', label: 'Servers', active: true}
        ]));

        dispatch(serversList());
    }

    render() {
        const {serversRequest} = this.props;

        if (!serversRequest || serversRequest.status === REQUEST) {
            return (
                <p className="text--center">Loading...</p>
            );
        }

        if (serversRequest.status === FAILURE) {
            return (
                <p className="text--center text--red">Error fetching servers.</p>
            );
        }

        const tagValue = (server, key) => {
            const tag = find(propEq('key', key), server.tags);
            return tag ? tag.value : null;
        };

        return (
            <div className="hosts">
                {serversRequest.content.results.map(server => {
                    return (
                        <div className="server-card" key={server.id}>
                            <div className="clearfix">
                                <div className="server-card__name">
                                    {tagValue(server, 'Name')}
                                </div>
                                <div className={'server-card__state server-card__state--' + server.state} />
                                <div className="server-card__az">
                                    {server.availabilityZone}
                                </div>
                            </div>
                            <div>
                                <div className="server-card__id">
                                    {server.id}
                                </div>
                            </div>
                            <div className="clearfix">
                                <div className="server-card__tags">
                                    env:
                                    <strong>{tagValue(server, 'environment')}</strong>
                                    &nbsp;
                                    roles:
                                    <strong>{tagValue(server, 'roles')}</strong>
                                </div>
                                <div className="server-card__ip">
                                    {server.privateIpAddress}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        serversRequest: state.api.servers.list
    };
}

export default connect(mapStateToProps)(Servers);
