// @flow

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'

import TimeSeriesGraph from '$shared/components/TimeSeriesGraph'
import ClientProvider from 'streamr-client-react'
import { Provider as SubscriptionStatusProvider } from '$shared/contexts/SubscriptionStatus'
import Subscription from '$shared/components/Subscription'
import useIsMounted from '$shared/hooks/useIsMounted'

type Props = {
    joinPartStreamId: ?string,
    memberCount: number,
    shownDays?: number,
}

type JoinPartMessage = {
    type: string,
    addresses: Array<string>,
}

type MessageMetadata = {
    messageId: {
        timestamp: number,
    }
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

const MembersGraph = ({ joinPartStreamId, memberCount, shownDays = 7 }: Props) => {
    const isMounted = useIsMounted()
    const [memberCountUpdatedAt, setMemberCountUpdatedAt] = useState(Date.now())
    const [memberData, setMemberData] = useState([])
    const [graphData, setGraphData] = useState([])
    const activeAddressesRef = useRef([])
    const [isActive, setIsActive] = useState(true)
    const [subscriptionKey, setSubscriptionKey] = useState(`subscription-${shownDays}`)

    useEffect(() => {
        // NOTE: We need to disable subscription for a while and enable it
        //       after a short delay because otherwise 'Subscription' component
        //       will trigger 'unsubscribed' event twice. Once for old and also
        //       for the newly created subscription. Might be a bug with
        //       streamr-client.
        setIsActive(false)
        setSubscriptionKey(`subscription-${shownDays}`)
        const timeoutId = setTimeout(() => {
            setIsActive(true)
        }, 100)
        return () => clearTimeout(timeoutId)
    }, [shownDays])

    const resendFrom = useMemo(() => (
        Date.now() - (shownDays * MILLISECONDS_IN_DAY)
    ), [shownDays])

    const onMessage = useCallback((data: JoinPartMessage, metadata: MessageMetadata) => {
        if (!isMounted()) { return }

        let diff = 0
        const activeAddresses = activeAddressesRef.current
        let msgAddresses = data.addresses

        // Sometimes data.addresses is not an array but raw string instead.
        // Correct this to be an array.
        if ((data.type === 'join' || data.type === 'part') && !Array.isArray(msgAddresses)) {
            msgAddresses = [((data.addresses: any): string)]
        }

        // Check if message type is 'join' or 'part' and
        // calculate member count diff based on the type.
        // E.g. 'join' with 3 addresses means +3 diff in member count.
        // JoinPartStream might have duplicate joins/parts for a
        // single address so make sure we skip duplicates.
        if (data.type === 'join' && msgAddresses && msgAddresses.length > 0) {
            msgAddresses.forEach((address) => {
                if (!activeAddresses.includes(address)) {
                    diff += 1
                    activeAddresses.push(address)
                }
            })
        } else if (data.type === 'part' && msgAddresses && msgAddresses.length > 0) {
            msgAddresses.forEach((address) => {
                if (activeAddresses.includes(address)) {
                    diff -= 1
                    const addrIndex = activeAddresses.indexOf(address)
                    if (addrIndex > -1) {
                        activeAddresses.splice(addrIndex, 1)
                    }
                }
            })
        } else {
            // Reject other message types.
            return
        }

        if (diff !== 0) {
            const entry = {
                timestamp: metadata.messageId.timestamp,
                diff,
            }
            setMemberData((oldArray) => [
                ...oldArray,
                entry,
            ])
        }
    }, [isMounted])

    useEffect(() => {
        memberData.sort((a, b) => b.timestamp - a.timestamp)

        // Only thing we know at the beginning is total member count
        // at given timestamp.
        const initialData = [{
            x: memberCountUpdatedAt,
            y: memberCount,
        }]

        // Because we cannot read the whole joinPartStream, we have to
        // work backwards from the initial state and calculate graph points
        // using the member count diff.
        const data = memberData.reduce((acc, element, index) => {
            acc.push({
                x: element.timestamp,
                y: acc[index].y - element.diff,
            })
            return acc
        }, initialData)

        // If there's only 1 data point, "extrapolate"
        // data to have 2 points so that we can draw
        // a line between them.
        if (data.length === 1) {
            data.push({
                x: data[0].x - (shownDays * MILLISECONDS_IN_DAY),
                y: data[0].y,
            })
        }
        setGraphData(data)
    }, [memberData, memberCount, memberCountUpdatedAt, shownDays])

    useEffect(() => {
        setMemberCountUpdatedAt(Date.now())
    }, [memberCount])

    useEffect(() => {
        // Clear member data when we change shownDays because
        // resubscription to stream will happen and data will
        // be resent
        setMemberData([])
        activeAddressesRef.current = []
    }, [shownDays, joinPartStreamId, onMessage])

    return (
        <ClientProvider verifySignatures="never">
            <SubscriptionStatusProvider>
                <Subscription
                    key={subscriptionKey}
                    uiChannel={{
                        id: joinPartStreamId,
                    }}
                    isActive={isActive}
                    onMessage={onMessage}
                    resendFrom={resendFrom}
                />
                <TimeSeriesGraph
                    graphData={graphData}
                    shownDays={shownDays}
                />
            </SubscriptionStatusProvider>
        </ClientProvider>
    )
}

export default MembersGraph
