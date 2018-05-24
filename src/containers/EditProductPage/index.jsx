// @flow

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { goBack, push } from 'react-router-redux'
import type { Match } from 'react-router-dom'

import type { Props as ProductPageProps } from '../../components/ProductPage'
import type { StoreState } from '../../flowtype/store-state'
import type { ProductId, EditProduct, SmartContractProduct, Product } from '../../flowtype/product-types'
import type { ErrorInUi } from '../../flowtype/common-types'
import type { Address } from '../../flowtype/web3-types'
import type { PriceDialogProps } from '../../components/Modal/SetPriceDialog'
import type { StreamList } from '../../flowtype/stream-types'
import type { CategoryList, Category } from '../../flowtype/category-types'
import type { OnUploadError } from '../../components/ImageUpload'
import type { User } from '../../flowtype/user-types'

import ProductPageEditorComponent from '../../components/ProductPageEditor'
import links from '../../links'

import { selectContractProduct } from '../../modules/contractProduct/selectors'
import { getProductById } from '../../modules/product/actions'
import {
    resetEditProduct,
    initEditProduct,
    updateEditProductField,
    setImageToUpload,
    createProductAndRedirect,
    initNewProduct,
} from '../../modules/editProduct/actions'
import { getStreams } from '../../modules/streams/actions'
import { showModal } from '../../modules/modals/actions'
import { getCategories } from '../../modules/categories/actions'
import { getUserProductPermissions } from '../../modules/user/actions'
import { getProductFromContract } from '../../modules/contractProduct/actions'
import {
    selectFetchingProduct,
    selectProductError,
    selectFetchingStreams,
    selectStreamsError,
    selectProduct,
} from '../../modules/product/selectors'
import { selectAccountId } from '../../modules/web3/selectors'
import { selectAllCategories, selectFetchingCategories } from '../../modules/categories/selectors'
import {
    selectProductEditPermission,
    selectProductPublishPermission,
    selectUserData,
} from '../../modules/user/selectors'
import { SET_PRICE, CONFIRM_NO_COVER_IMAGE, SAVE_PRODUCT } from '../../utils/modals'
import { selectStreams as selectAvailableStreams } from '../../modules/streams/selectors'
import {
    selectEditProduct,
    selectStreams,
    selectCategory,
    selectImageToUpload,
} from '../../modules/editProduct/selectors'
import { productStates, notificationIcons } from '../../utils/constants'
import { formatPath } from '../../utils/url'
import { areAddressesEqual } from '../../utils/smartContract'
import { arePricesEqual } from '../../utils/price'
import { isPaidProduct } from '../../utils/product'
import { hasKnownHistory } from '../../utils/history'
import { editProductValidator } from '../../validators'
import { notifyErrors as notifyErrorsHelper } from '../../utils/validate'
import { showNotification as showNotificationAction } from '../../modules/notifications/actions'

export type OwnProps = {
    match: Match,
    ownerAddress: ?Address,
}

export type StateProps = ProductPageProps & {
    contractProduct: ?SmartContractProduct,
    availableStreams: StreamList,
    productError: ?ErrorInUi,
    streamsError: ?ErrorInUi,
    fetchingProduct: boolean,
    categories: CategoryList,
    category: ?Category,
    editPermission: boolean,
    publishPermission: boolean,
    imageUpload: ?File,
    fetchingCategories: boolean,
    streams: StreamList,
    fetchingStreams: boolean,
    product: ?Product,
    editProduct: ?Product,
    user: ?User,
}

export type DispatchProps = {
    getProductById: (ProductId) => void,
    getContractProduct: (id: ProductId) => void,
    confirmNoCoverImage: (Function) => void,
    setImageToUploadProp: (File) => void,
    openPriceDialog: (PriceDialogProps) => void,
    onEditProp: (string, any) => void,
    initEditProductProp: () => void,
    getUserProductPermissions: (ProductId) => void,
    showSaveDialog: (ProductId, Function, boolean) => void,
    onCancel: (ProductId) => void,
    notifyErrors: (errors: Object) => void,
    onUploadError: OnUploadError,
    initProduct: () => void,
    getCategories: () => void,
    getStreams: () => void,
    onPublish: () => void,
    onSaveAndExit: () => void,
    redirect: (...any) => void,
    onReset: () => void,
}

type Props = OwnProps & StateProps & DispatchProps

class EditProductPage extends Component<Props> {
    componentDidMount() {
        const { match } = this.props
        this.props.onReset()
        this.props.getCategories()
        this.props.getStreams()
        if (this.isEdit()) {
            this.props.getProductById(match.params.id)
            this.props.getUserProductPermissions(match.params.id)
            this.props.getContractProduct(match.params.id)
        } else {
            this.props.initProduct()
        }
    }

    componentDidUpdate(prevProps) {
        if (this.isEdit() && prevProps.product && !prevProps.editProduct) {
            this.props.initEditProductProp()
        }
    }

    componentWillUnmount() {
        this.props.onReset()
    }

    getPublishButtonTitle = (product: EditProduct) => {
        switch (product.state) {
            case productStates.DEPLOYED:
                return 'Unpublish'
            case productStates.DEPLOYING:
                return 'Publishing'
            case productStates.UNDEPLOYING:
                return 'Unpublishing'
            case productStates.NOT_DEPLOYED:
            default:
                return 'Publish'
        }
    }

    getPublishButtonDisabled = (product: EditProduct) =>
        product.state === productStates.DEPLOYING || product.state === productStates.UNDEPLOYING

    getToolBarActions = () => {
        if (this.isEdit()) {
            const { editPermission, publishPermission, redirect, editProduct } = this.props
            const toolbarActions = {}
            if (editPermission) {
                toolbarActions.saveAndExit = {
                    title: 'Save & Exit',
                    onClick: () => this.validateProductBeforeSaving(() => redirect(links.myProducts)),
                }
            }

            if (editProduct && publishPermission) {
                toolbarActions.publish = {
                    title: this.getPublishButtonTitle(editProduct),
                    disabled: this.getPublishButtonDisabled(editProduct),
                    color: 'primary',
                    onClick: () => this.validateProductBeforeSaving((id) => redirect(links.products, id, 'publish')),
                    className: 'hidden-xs-down',
                }
            }
            return toolbarActions
        }
        const { onSaveAndExit, onPublish } = this.props

        return {
            saveAndExit: {
                title: 'Save & Exit',
                onClick: () => this.validateProductBeforeSaving(onSaveAndExit),
            },
            publish: {
                title: 'Publish',
                color: 'primary',
                onClick: () => this.validateProductBeforeSaving(onPublish),
                className: 'hidden-xs-down',
            },
        }
    }

    isEdit = () => this.props.match.params.id

    validateProductBeforeSaving = (nextAction: Function) => {
        const { editProduct, notifyErrors } = this.props

        if (editProduct) {
            editProductValidator(editProduct)
                .then(() => {
                    this.confirmCoverImageBeforeSaving(nextAction)
                }, notifyErrors)
        }
    }

    confirmCoverImageBeforeSaving = (nextAction: Function) => {
        const {
            product,
            editProduct,
            imageUpload,
            confirmNoCoverImage,
            showSaveDialog,
            contractProduct,
        } = this.props

        if (product && editProduct) {
            const requireWeb3 = isPaidProduct(product) && !!contractProduct && (
                !areAddressesEqual(product.beneficiaryAddress, editProduct.beneficiaryAddress) ||
                !arePricesEqual(product.pricePerSecond, editProduct.pricePerSecond)
            )
            if (!editProduct.imageUrl && !imageUpload) {
                confirmNoCoverImage(() => showSaveDialog(editProduct.id || '', nextAction, requireWeb3))
            } else if (this.isEdit()) {
                showSaveDialog(editProduct.id || '', nextAction, requireWeb3)
            } else {
                nextAction()
            }
        } else {
            nextAction()
        }
    }

    render() {
        const {
            editProduct,
            category,
            streams,
            availableStreams,
            fetchingProduct,
            fetchingStreams,
            setImageToUploadProp,
            openPriceDialog,
            onEditProp,
            onCancel,
            ownerAddress,
            categories,
            user,
            onUploadError,
        } = this.props

        return editProduct && (
            <ProductPageEditorComponent
                isPriceEditable={!this.isEdit() || isPaidProduct(editProduct)}
                product={editProduct}
                streams={streams}
                category={category}
                categories={categories}
                availableStreams={availableStreams}
                fetchingStreams={fetchingProduct || fetchingStreams}
                toolbarActions={this.getToolBarActions()}
                setImageToUpload={setImageToUploadProp}
                openPriceDialog={(props) => openPriceDialog({
                    ...props,
                    productId: editProduct.id,
                    isFree: editProduct.isFree,
                    requireOwnerIfDeployed: true,
                })}
                onUploadError={onUploadError}
                onEdit={onEditProp}
                onCancel={onCancel}
                ownerAddress={ownerAddress}
                user={user}
            />
        )
    }
}

const mapStateToProps = (state: StoreState): StateProps => ({
    product: selectProduct(state),
    editProduct: selectEditProduct(state),
    contractProduct: selectContractProduct(state),
    streams: selectStreams(state),
    availableStreams: selectAvailableStreams(state),
    fetchingProduct: selectFetchingProduct(state),
    productError: selectProductError(state),
    fetchingStreams: selectFetchingStreams(state),
    streamsError: selectStreamsError(state),
    ownerAddress: selectAccountId(state),
    categories: selectAllCategories(state),
    category: selectCategory(state),
    editPermission: selectProductEditPermission(state),
    publishPermission: selectProductPublishPermission(state),
    imageUpload: selectImageToUpload(state),
    fetchingCategories: selectFetchingCategories(state),
    user: selectUserData(state),
})

const mapDispatchToProps = (dispatch: Function): DispatchProps => ({
    getProductById: (id: ProductId) => dispatch(getProductById(id)),
    getContractProduct: (id: ProductId) => dispatch(getProductFromContract(id)),
    confirmNoCoverImage: (onContinue: Function) => dispatch(showModal(CONFIRM_NO_COVER_IMAGE, {
        onContinue,
        closeOnContinue: false,
    })),
    onUploadError: (errorMessage: string) => dispatch(showNotificationAction(errorMessage, notificationIcons.ERROR)),
    setImageToUploadProp: (image: File) => dispatch(setImageToUpload(image)),
    onEditProp: (field: string, value: any) => dispatch(updateEditProductField(field, value)),
    initEditProductProp: () => dispatch(initEditProduct()),
    getUserProductPermissions: (id: ProductId) => dispatch(getUserProductPermissions(id)),
    showSaveDialog: (productId: ProductId, redirect: Function, requireWeb3: boolean) => dispatch(showModal(SAVE_PRODUCT, {
        productId,
        redirect,
        requireOwnerIfDeployed: true,
        requireWeb3,
    })),
    onCancel: (productId: ProductId) => {
        dispatch(resetEditProduct())
        const a = hasKnownHistory() ? goBack() : push(formatPath(links.products, productId || ''))

        dispatch(a)
    },
    notifyErrors: (errors: Object) => {
        notifyErrorsHelper(dispatch, errors)
    },
    initProduct: () => dispatch(initNewProduct()),
    getCategories: () => dispatch(getCategories(true)),
    getStreams: () => dispatch(getStreams()),
    redirect: (...params) => dispatch(push(formatPath(...params))),
    onPublish: () => {
        dispatch(createProductAndRedirect((id) => formatPath(links.products, id, 'publish')))
    },
    onSaveAndExit: () => {
        dispatch(createProductAndRedirect((id) => formatPath(links.products, id)))
    },
    openPriceDialog: (props: PriceDialogProps) => dispatch(showModal(SET_PRICE, {
        ...props,
    })),
    onReset: () => {
        dispatch(resetEditProduct())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(EditProductPage)
