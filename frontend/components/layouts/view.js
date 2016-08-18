import React, {Component} from 'react';
import {connect} from 'react-redux';

class View extends Component {
    render() {
        const {children, currentUser} = this.props;

        return (
            <div className="view">
                <header className="view__header">
                    <div className="view__header__user">
                        {currentUser.name} ({currentUser.email})
                    </div>
                </header>
                {children}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.authentication.currentUser
    };
}

export default connect(mapStateToProps)(View);
