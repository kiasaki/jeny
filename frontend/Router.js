import React, {Component, PropTypes} from 'react';
import URL from 'url';
import {connect} from 'react-redux';
import {Router as EnrouteRouter, Route} from 'react-enroute';

import LayoutsView from '@jeny/components/layouts/view';
import ViewsHome from '@jeny/components/views/home';
import ViewsApplication from '@jeny/components/views/application';
import ViewsApplications from '@jeny/components/views/applications';
import ViewsServers from '@jeny/components/views/servers';
import ViewsNotFound from '@jeny/components/views/not-found';

class Router extends Component {
    render() {
        const query = URL.parse(window.location.href, true).query;

        return (
            <EnrouteRouter
                location={this.props.location}
                query={query}
                hash={window.location.hash}
            >
                <Route path="" component={LayoutsView}>
                    <Route path="/" component={ViewsHome} />
                    <Route path="/applications" component={ViewsApplications} />
                    <Route path="/applications/:id" component={ViewsApplication} />
                    <Route path="/servers" component={ViewsServers} />
                    <Route path="/*" component={ViewsNotFound} />
                </Route>
            </EnrouteRouter>
        );
    }
}

Router.propTypes = {
    location: PropTypes.string.isRequired
};

function mapStateToProps(state) {
    return {
        location: state.routing.location
    };
}

export default connect(mapStateToProps)(Router);
