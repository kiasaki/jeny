import React, {Component} from 'react';
import {connect} from 'react-redux';

import Link from '@jeny/components/link';

class View extends Component {
    render() {
        const {children, title, buttons, currentUser} = this.props;

        return (
            <div className="view">
                <header className="view__header">
                    <div className="content">
                        <div className="view__header__top-row clearfix">
                            <nav className="view__header__nav">
                                <Link to="/applications">Applications</Link>
                                <Link to="/hosts">Hosts</Link>
                            </nav>
                            <div className="view__header__user dropdown__container">
                                {currentUser.name} ({currentUser.email}) ▾
                                <div className="dropdown">
                                    <a className="dropdown__item" href="/oauth/logout">Log out</a>
                                </div>
                            </div>
                        </div>
                        <div className="view__header__middle-row">
                            <h1>{title || 'Jeny'}</h1>
                        </div>
                        <div className="view__header__bottom-row">
                            {(buttons || []).map(button => (
                                <Link to={button.link} key={button.link} className={button.active ? 'active' : ''}>
                                    {button.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </header>
                <div className="content">
                    {children}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.authentication.currentUser,
        title: state.view.title,
        buttons: state.view.buttons
    };
}

export default connect(mapStateToProps)(View);
