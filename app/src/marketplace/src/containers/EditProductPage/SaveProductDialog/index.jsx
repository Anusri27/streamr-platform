// @flow

import React from 'react'
import { connect } from 'react-redux'

import SaveProductDialogComponent from '../../../components/Modal/SaveProductDialog/index'
import { selectEditProduct, selectTransactionState as selectUpdateTransactionState } from '../../../modules/editProduct/selectors'
import { selectTransactionState as selectContractTransactionState } from '../../../modules/updateContractProduct/selectors'
import { updateContractProduct as updateContractProductAction } from '../../../modules/updateContractProduct/actions'
import { selectFetchingContractProduct, selectContractProduct, selectContractProductError } from '../../../modules/contractProduct/selectors'
import { isUpdateContractProductRequired } from '../../../utils/smartContract'
import { updateProduct as updateProductAction } from '../../../modules/editProduct/actions'
import { hideModal } from '../../../modules/modals/actions'
import { transactionStates } from '../../../utils/constants'
import type { StoreState } from '../../../flowtype/store-state'
import type { ProductId, EditProduct, SmartContractProduct } from '../../../flowtype/product-types'
import type { TransactionState } from '../../../flowtype/common-types'
import withContractProduct from '../../WithContractProduct/index'

type StateProps = {
    editProduct: ?EditProduct, // eslint-disable-line react/no-unused-prop-types
    contractTransactionState: ?TransactionState,
    updateTransactionState: ?TransactionState,
}

type DispatchProps = {
    updateProduct: () => void, // eslint-disable-line react/no-unused-prop-types
    updateContractProduct: (ProductId, SmartContractProduct) => void, // eslint-disable-line react/no-unused-prop-types
    onCancel: () => void,
}

type OwnProps = {
    redirect: (ProductId) => void, // eslint-disable-line react/no-unused-prop-types
    contractProduct: ?SmartContractProduct, // eslint-disable-line react/no-unused-prop-types
}

type Props = StateProps & DispatchProps & OwnProps

export class SaveProductDialog extends React.Component<Props> {
    constructor(props: Props) {
        super(props)

        this.startTransaction = this.startTransaction.bind(this)
    }

    componentDidMount() {
        this.startTransaction(this.props)
    }

    componentWillReceiveProps(nextProps: Props) {
        this.startTransaction(nextProps)
    }

    updateTransactionStarted: boolean = false
    contractTransactionStarted: boolean = false

    /* :: startTransaction: (Props) => void */
    startTransaction(props: Props) {
        const {
            editProduct,
            updateContractProduct,
            updateProduct,
            contractProduct,
            redirect,
            contractTransactionState,
            updateTransactionState,
        } = props
        if (editProduct) {
            // Determine if we need to update price or beneficiaryAddress to contract
            if (contractProduct && !this.contractTransactionStarted &&
                isUpdateContractProductRequired(contractProduct, editProduct)
            ) {
                updateContractProduct(editProduct.id || '', {
                    ...contractProduct,
                    pricePerSecond: editProduct.pricePerSecond,
                    beneficiaryAddress: editProduct.beneficiaryAddress,
                    priceCurrency: editProduct.priceCurrency,
                })
                this.contractTransactionStarted = true
            } else if (!this.updateTransactionStarted) {
                // Start the normal API update
                updateProduct()
                this.updateTransactionStarted = true
            }

            // Redirect after successful transaction
            if ((this.contractTransactionStarted &&
                contractTransactionState === transactionStates.CONFIRMED) ||
                (!this.contractTransactionStarted &&
                this.updateTransactionStarted &&
                updateTransactionState === transactionStates.CONFIRMED)
            ) {
                setTimeout(() => {
                    redirect(editProduct.id || '')
                }, 1000)
            }
        }
    }

    render() {
        const { editProduct, onCancel, contractTransactionState, updateTransactionState } = this.props

        if (editProduct) {
            return (
                <SaveProductDialogComponent
                    transactionState={this.contractTransactionStarted ? contractTransactionState : updateTransactionState}
                    onClose={onCancel}
                />
            )
        }

        return null
    }
}

export const mapStateToProps = (state: StoreState): StateProps => ({
    editProduct: selectEditProduct(state),
    contractProduct: selectContractProduct(state),
    fetchingContractProduct: selectFetchingContractProduct(state),
    contractProductError: selectContractProductError(state),
    contractTransactionState: selectContractTransactionState(state),
    updateTransactionState: selectUpdateTransactionState(state),
})

export const mapDispatchToProps = (dispatch: Function): DispatchProps => ({
    updateProduct: () => dispatch(updateProductAction()),
    updateContractProduct: (productId: ProductId, product: SmartContractProduct) => dispatch(updateContractProductAction(productId, product)),
    onCancel: () => dispatch(hideModal()),
})

export default connect(mapStateToProps, mapDispatchToProps)(withContractProduct(SaveProductDialog))
