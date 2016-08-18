import React, {Component} from 'react';

class NotFound extends Component {
    render() {
        return (
            <div className="not-found">
                <h1>Not Found</h1>
                <p>{'It looks like this page doesn\'t exist.'}</p>
            </div>
        );
    }
}

export default NotFound;
