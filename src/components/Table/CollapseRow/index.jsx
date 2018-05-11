// @flow

import React from 'react'
import classNames from 'classnames'
import { Row as LayoutRow, Collapse, Col } from '@streamr/streamr-layout'
import type { Node } from 'react'

import pageStyles from '../table.pcss'

export type Props = {
    title: string,
    className: string,
    children?: Node,
    actionComponent?: Node,
}

export type State = {
    open: boolean,
}

class CollapseRow extends React.Component<Props, State> {
    state = {
        open: false,
    }

    toggle = () => {
        this.setState({
            open: !this.state.open,
        })
    }

    render() {
        const { title,
            className,
            children,
            actionComponent } = this.props

        return (
            <LayoutRow className={
                classNames({
                    [className]: true,
                    [pageStyles.row]: true,
                    [pageStyles.collapseRowOpen]: this.state.open,
                })}
            >
                <Col
                    xs={12}
                    className={classNames(pageStyles.cell, pageStyles.collapseRowHeading)}
                    onClick={this.toggle}
                >
                    <div className="float-left">
                        {title}
                    </div>
                    <span className={classNames({
                        'float-right': true,
                        [pageStyles.collapseCaret]: true,
                        [pageStyles.collapseCaretOpened]: this.state.open,
                    })}
                    >
                        <svg width="13px" height="7px" viewBox="0 0 13 7">
                            <g id="Product-Detail-Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Product-view-/-Mobile" strokeWidth="1" transform="translate(-335.000000, -740.000000)" stroke="#525252">
                                    <polyline
                                        id="Path-2"
                                        transform="translate(341.656854, 740.656854) rotate(45.000000) translate(-341.656854, -740.656854) "
                                        points="345.656854 736.656854 345.656854 744.656854 337.656854 744.656854"
                                    />
                                </g>
                            </g>
                        </svg>
                    </span>
                </Col>
                <Col xs={12}>
                    <Collapse isOpen={this.state.open}>
                        {actionComponent && (
                            <div className={pageStyles.collapseItem}>
                                {actionComponent}
                            </div>
                        )}
                        <div className={classNames(pageStyles.collapseItem, pageStyles.cell)}>
                            {children}
                        </div>
                    </Collapse>
                </Col>
            </LayoutRow>
        )
    }
}

export default CollapseRow
