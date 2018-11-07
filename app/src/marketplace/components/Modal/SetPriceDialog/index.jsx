// @flow

import React from 'react'
import BN from 'bignumber.js'
import omit from 'lodash/omit'
import { Container, Col, Row } from 'reactstrap'
import { Translate } from 'react-redux-i18n'

import ModalDialog from '$mp/components/ModalDialog'
import Steps from '$mp/components/Steps'
import Step from '$mp/components/Steps/Step'
import PaymentRate from '$mp/components/PaymentRate'
import type { TimeUnit, Currency, NumberString } from '$shared/flowtype/common-types'
import type { Address } from '$shared/flowtype/web3-types'
import { DEFAULT_CURRENCY, timeUnits } from '$shared/utils/constants'
import { convert, pricePerSecondFromTimeUnit, isPriceValid } from '$mp/utils/price'
import { priceDialogValidator } from '$mp/validators'
import withI18n from '$mp/containers/WithI18n'

import PaymentRateEditor from './PaymentRateEditor'
import styles from './setPriceDialog.pcss'
import EthAddressField from './EthAddressField'

export type PriceDialogProps = {
    startingAmount: ?NumberString,
    currency: Currency,
    beneficiaryAddress: ?Address,
}

export type PriceDialogResult = {
    amount: NumberString,
    timeUnit: TimeUnit,
    beneficiaryAddress: ?Address,
    ownerAddress: ?Address,
    priceCurrency: Currency,
}

type Props = PriceDialogProps & {
    accountId: ?Address,
    dataPerUsd: NumberString,
    onClose: () => void,
    onResult: (PriceDialogResult) => void,
    isFree?: boolean,
    translate: (key: string, options: any) => string,
}

type State = {
    amount: ?NumberString,
    timeUnit: TimeUnit,
    beneficiaryAddress: ?Address,
    priceCurrency: Currency,
    errors: ?{
        [string]: string,
    }
}

class SetPriceDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        const { startingAmount, beneficiaryAddress, accountId, currency } = this.props

        this.state = {
            amount: startingAmount,
            timeUnit: timeUnits.hour,
            beneficiaryAddress: beneficiaryAddress || accountId,
            priceCurrency: currency || DEFAULT_CURRENCY,
            errors: {},
        }
    }

    onPriceChange = (amount: NumberString) => {
        this.setState({
            amount,
            errors: {
                ...this.state.errors,
                price: isPriceValid(amount) ? '' : this.props.translate('validation.invalidPrice'),
                pricePerSecond: '',
            },
        })
    }

    onPriceUnitChange = (timeUnit: TimeUnit) => {
        this.setState({
            timeUnit,
        })
    }

    onPriceCurrencyChange = (priceCurrency: Currency) => {
        this.onPriceChange(convert(this.state.amount || '0', this.props.dataPerUsd, this.state.priceCurrency, priceCurrency))
        this.setState({
            priceCurrency,
        })
    }

    onBeneficiaryAddressChange = (beneficiaryAddress: Address) => {
        this.setState({
            beneficiaryAddress,
            errors: omit(this.state.errors, 'beneficiaryAddress'),
        })
    }

    onComplete = () => {
        const { onClose, onResult, isFree, accountId } = this.props
        const { amount, timeUnit, beneficiaryAddress, priceCurrency } = this.state
        const actualAmount = BN(amount || 0)

        priceDialogValidator({
            amount: actualAmount.toString(),
            timeUnit,
            priceCurrency: priceCurrency || DEFAULT_CURRENCY,
            beneficiaryAddress,
            ownerAddress: accountId,
            isFree,
        }).then(
            (result) => {
                if (result) {
                    onResult(result)
                    onClose()
                }
            },
            (errors) => {
                this.setState({
                    errors,
                })
            },
        )
    }
    getErrors = (): Array<string> => (Object.values(this.state.errors): Array<any>).filter((a) => a)

    isBNAmountValid = (BNAmount: any) => !BNAmount.isNaN() && BNAmount.isPositive()

    render() {
        const { onClose, dataPerUsd, accountId, translate } = this.props
        const { amount,
            timeUnit,
            beneficiaryAddress,
            priceCurrency } = this.state
        const BNAmount = BN(amount)
        return (
            <ModalDialog onClose={onClose} className={styles.dialog} backdropClassName={styles.backdrop}>
                <Container>
                    <Col
                        sm={12}
                        xl={{
                            size: 8,
                            offset: 2,
                        }}
                    >
                        <Row noGutters>
                            <Steps
                                onCancel={onClose}
                                onComplete={this.onComplete}
                                isDisabled={this.getErrors().length > 0}
                                errors={this.getErrors()}
                            >
                                <Step
                                    title={translate('modal.setPrice.setPrice')}
                                    nextButtonLabel={BNAmount.isEqualTo(0) ? translate('modal.setPrice.finish') : ''}
                                >
                                    <PaymentRate
                                        currency={priceCurrency}
                                        amount={pricePerSecondFromTimeUnit(BNAmount, timeUnit)}
                                        timeUnit={timeUnits.hour}
                                        className={styles.paymentRate}
                                        maxDigits={4}
                                    />
                                    <PaymentRateEditor
                                        dataPerUsd={dataPerUsd}
                                        amount={amount}
                                        timeUnit={timeUnit}
                                        priceCurrency={priceCurrency}
                                        className={styles.paymentRateEditor}
                                        onPriceChange={this.onPriceChange}
                                        onPriceUnitChange={this.onPriceUnitChange}
                                        onPriceCurrencyChange={this.onPriceCurrencyChange}
                                    />
                                </Step>
                                <Step
                                    title={translate('modal.setPrice.setAddresses')}
                                    className={styles.addresses}
                                    disabled={BNAmount.isEqualTo(0)}
                                >
                                    <EthAddressField
                                        id="ownerAddress"
                                        label={translate('modal.setPrice.ownerAddress')}
                                        value={accountId || ''}
                                    />
                                    <EthAddressField
                                        id="beneficiaryAddress"
                                        label={translate('modal.setPrice.beneficiaryAddress')}
                                        value={beneficiaryAddress || ''}
                                        onChange={this.onBeneficiaryAddressChange}
                                        hasError={!!(this.state.errors && this.state.errors.beneficiaryAddress)}
                                    />
                                    <p className={styles.info}><Translate value="modal.setPrice.required" /></p>
                                </Step>
                            </Steps>
                        </Row>
                    </Col>
                </Container>
            </ModalDialog>
        )
    }
}

export default withI18n(SetPriceDialog)
