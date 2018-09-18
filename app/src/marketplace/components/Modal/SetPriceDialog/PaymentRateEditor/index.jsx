// @flow

import React from 'react'
import classNames from 'classnames'
import { Row, Col } from 'reactstrap'

import TimeUnitSelector from '../TimeUnitSelector/index'
import AmountEditor from '../AmountEditor/index'
import { currencies } from '../../../../../../../marketplace/src/utils/constants'
import type { Currency, NumberString, TimeUnit } from '../../../../../../../marketplace/src/flowtype/common-types'
import FixedPriceSelector from './FixedPriceSelector/index'

import styles from './paymentRateEditor.pcss'

export type PaymentRateChange = {
    amount?: ?NumberString,
    timeUnit?: TimeUnit,
}

type Props = {
    amount: ?NumberString,
    dataPerUsd: NumberString,
    timeUnit: TimeUnit,
    priceCurrency: Currency,
    className?: string,
    onPriceChange: (NumberString) => void,
    onPriceUnitChange: (TimeUnit) => void,
    onPriceCurrencyChange: (Currency) => void,
}

const PaymentRateEditor = ({
    className,
    timeUnit,
    amount,
    dataPerUsd,
    priceCurrency,
    onPriceChange,
    onPriceCurrencyChange,
    onPriceUnitChange,
}: Props) => (
    <div className={classNames(styles.editor, className)}>
        <Row>
            <Col xs={12} md={5}>
                <AmountEditor
                    amount={amount}
                    dataPerUsd={dataPerUsd}
                    currency={priceCurrency}
                    onChange={onPriceChange}
                />
                <FixedPriceSelector
                    onValue={currencies.USD}
                    offValue={currencies.DATA}
                    value={priceCurrency}
                    onChange={onPriceCurrencyChange}
                />
            </Col>
            <Col md={2} className={styles.per}>Per</Col>
            <Col xs={12} md={5} className={styles.timeUnits}>
                <TimeUnitSelector
                    selected={timeUnit}
                    onChange={onPriceUnitChange}
                />
            </Col>
        </Row>
    </div>
)

export default PaymentRateEditor
