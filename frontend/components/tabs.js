import React, {Component, PropTypes} from 'react';
import {map, reverse} from 'ramda';

import {classNames} from '@jeny/utils';

class Tabs extends Component {
    constructor(props) {
        super(props);

        this.renderTab = this.renderTab.bind(this);
    }

    renderAddButton() {
        const {onAdd} = this.props;

        if (!onAdd) {
            return null;
        }

        return (
            <i className="tabs__add icon-plus" onClick={onAdd} />
        );
    }

    renderTab(item) {
        const {selectedItem, onSelect} = this.props;

        return (
            <div
                key={item.id}
                onClick={onSelect.bind(null, item)}
                className={classNames({
                    'tabs__tab': true,
                    'tabs__tab--active': selectedItem === item.id
                })}
            >
                {item.name}
            </div>
        );
    }

    render() {
        return (
            <div className="tabs">
                {map(this.renderTab, this.props.items)}
                <div className="tabs__spacer">
                    {this.renderAddButton()}
                </div>
            </div>
        );
    }
}

Tabs.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    selectedItem: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onAdd: PropTypes.func
};

export default Tabs;
