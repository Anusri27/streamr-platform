// @flow

import React from 'react'
import { Container, Button } from '@streamr/streamr-layout'
import classNames from 'classnames'
import MediaQuery from 'react-responsive'

import type { Stream, StreamList, StreamId } from '../../../flowtype/stream-types'
import { Row, CollapseRow, HeaderRow } from '../../Table'
import { formatExternalUrl, formatPath } from '../../../utils/url'
import type { Product, ProductId } from '../../../flowtype/product-types'
import links from '../../../links'

import styles from './streamListing.pcss'

export type Props = {
    product: ?Product,
    fetchingStreams: boolean,
    streams: StreamList,
    showStreamActions?: boolean,
    isLoggedIn?: boolean,
    isProductFree?: boolean,
    isProductSubscriptionValid?: boolean,
    className?: string,
}

const KeylockIconSvg = () => (
    <svg width="9px" height="12px" viewBox="0 0 9 12">
        <g id="Product-Detail-Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="Product-Detail-Page-/-Purchases" transform="translate(-221.000000, -682.000000)" fill="#525252" fillRule="nonzero">
                <path
                    d="M229.5,686 L229,686 L229,685.5 C229,683.57 227.43,682 225.5,682 C223.57,682
                222,683.57 222,685.5 L222,686 L221.5,686 C221.224,686 221,686.224 221,686.5 L221,693.5
                C221,693.776 221.224,694 221.5,694 L229.5,694 C229.776,694 230,693.776 230,693.5 L230,686.5
                C230,686.224 229.776,686 229.5,686 Z M223,685.5 C223,684.121 224.121,683 225.5,683 C226.879,683
                228,684.121 228,685.5 L228,686 L223,686 L223,685.5 Z M226,689.847 L226,691.501 C226,691.777
                225.775,692.001 225.499,692.001 C225.223,692.001 225,691.777 225,691.501 L225,689.847 C224.706,689.672
                224.5,689.365 224.5,689 C224.5,688.448 224.948,688 225.5,688 C226.052,688 226.5,688.448 226.5,689
                C226.5,689.365 226.293,689.672 226,689.847 Z"
                    id="Keylock-icon"
                />
            </g>
        </g>
    </svg>
)

const hoverComponent = (
    productId: ?ProductId, streamId: StreamId, isLoggedIn: boolean,
    isProductFree: boolean, isProductSubscriptionValid: ?boolean,
) => (
    <div className={styles.hoverContainer}>
        {(isLoggedIn && (isProductFree || isProductSubscriptionValid)) &&
            <Button
                color="secondary"
                size="sm"
                className="hidden-md-down"
                href={formatExternalUrl(links.newCanvas, {
                    addStream: streamId,
                })}
            >
                Add to editor
            </Button>
        }
        {/* No need to show the preview button on editProduct page */}
        {(isProductFree || (isLoggedIn && isProductSubscriptionValid)) && productId && (
            <Button
                color="secondary"
                size="sm"
                className="hidden-md-down"
                href={formatPath(links.products, productId, 'streamPreview', streamId)}
            >
                View live data
            </Button>
        )}
        {(!isProductFree && !isProductSubscriptionValid) &&
            <div><KeylockIconSvg /> Purchase to unlock</div>
        }
        {(!isLoggedIn && !isProductFree && isProductSubscriptionValid) &&
            <div>Log in to interact with this stream</div>
        }
    </div>
)

const titleStreamCount = (count) => (
    <div>
        Streams <span className={styles.streamCount}>{count}</span>
    </div>
)

const StreamListing = ({
    product,
    streams,
    fetchingStreams,
    showStreamActions,
    isLoggedIn,
    isProductFree,
    isProductSubscriptionValid,
    className,
}: Props) => (
    <Container id={styles.details} className={classNames(styles.details, className)}>
        <div className={classNames(styles.streams)}>
            <HeaderRow title={titleStreamCount(streams.length || 0)} className={styles.headerRow}>
                <MediaQuery minWidth={767}>
                    Description
                </MediaQuery>
            </HeaderRow>
            {fetchingStreams && (
                <Row>
                    Loading streams...
                </Row>
            )}
            {!fetchingStreams && streams.length > 0 && streams.map(({ id: streamId, name, description }: Stream) => (
                <MediaQuery key={streamId} maxWidth={768}>
                    {(matches) => {
                        if (matches) {
                            return (
                                <CollapseRow
                                    className={styles.streamListingCollapseRow}
                                    title={name}
                                    actionComponent={showStreamActions &&
                                    hoverComponent(
                                        product && product.id, streamId, !!isLoggedIn,
                                        !!isProductFree, !!isProductSubscriptionValid,
                                    )
                                    }
                                >
                                    {description}
                                </CollapseRow>
                            )
                        }
                        return (
                            <Row
                                className={styles.streamListingRow}
                                title={name}
                                hoverComponent={showStreamActions &&
                                    hoverComponent(
                                        product && product.id, streamId, !!isLoggedIn,
                                        !!isProductFree, !!isProductSubscriptionValid,
                                    )
                                }
                            >
                                {description}
                            </Row>
                        )
                    }}

                </MediaQuery>
            ))}
            {!fetchingStreams && streams.length === 0 && (
                <Row
                    className={styles.streamListingRow}
                >
                    No streams found.
                </Row>
            )}
        </div>
    </Container>
)

export default StreamListing
