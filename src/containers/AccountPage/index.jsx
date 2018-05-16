// @flow

import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { formatPath } from '../../utils/url'
import links from '../../links'
import { getUserData } from '../../modules/user/actions'
import AccountPageComponent from '../../components/AccountPage'
import type { User } from '../../flowtype/user-types'
import { selectUserData } from '../../modules/user/selectors'
import type { StoreState } from '../../flowtype/store-state'

import type { ProductList, Product, ProductId } from '../../flowtype/product-types'
import { getMyProducts } from '../../modules/myProductList/actions'
import { getMyPurchases } from '../../modules/myPurchaseList/actions'
import { PUBLISH } from '../../utils/modals'
import { showModal } from '../../modules/modals/actions'

import { selectMyProductList, selectFetchingMyProductList } from '../../modules/myProductList/selectors'
import { selectMyPurchaseList, selectFetchingMyPurchaseList } from '../../modules/myPurchaseList/selectors'

export type AccountPageTab = 'purchases' | 'products'

type StateProps = {
    user: ?User,
    myProducts: ProductList,
    isFetchingMyProducts: boolean,
    myPurchases: ProductList,
    isFetchingMyPurchases: boolean,
}

type DispatchProps = {
    getUserData: () => void,
    getMyProducts: () => void,
    getMyPurchases: () => void,
    redirectToEditProduct: (id: ProductId) => void,
    showPublishDialog: (product: Product) => void,
}

type OwnProps = {
    tab: AccountPageTab, // Given in router
}

type RouterProps = {
    match: {
        params: {
            tab: AccountPageTab
        }
    }
}

type Props = StateProps & DispatchProps & OwnProps & RouterProps

class AccountPage extends React.Component<Props> {
    componentWillMount() {
        const { isFetchingMyProducts, isFetchingMyPurchases, match: { params: { tab: currentTab } } } = this.props

        this.props.getUserData()
        if (currentTab === 'products' && !isFetchingMyProducts) {
            this.props.getMyProducts()
        }
        if (currentTab === 'purchases' && !isFetchingMyPurchases) {
            this.props.getMyPurchases()
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { isFetchingMyProducts, isFetchingMyPurchases, match: { params: { tab: currentTab } } } = this.props

        if (currentTab !== prevProps.match.params.tab) {
            this.props.getUserData()
            if (currentTab === 'products' && !isFetchingMyProducts) {
                this.props.getMyProducts()
            }
            if (currentTab === 'purchases' && !isFetchingMyPurchases) {
                this.props.getMyPurchases()
            }
        }
    }

    render() {
        const {
            myProducts,
            isFetchingMyProducts,
            myPurchases,
            isFetchingMyPurchases,
            user,
            redirectToEditProduct,
            showPublishDialog,
            match: { params: { tab } },
        } = this.props

        const products = tab === 'products' ? myProducts : myPurchases
        const isFetchingProducts = tab === 'products' ? isFetchingMyProducts : isFetchingMyPurchases

        return (
            <AccountPageComponent
                user={user}
                tab={tab}
                products={products}
                isFetchingProducts={isFetchingProducts}
                redirectToEditProduct={redirectToEditProduct}
                showPublishDialog={showPublishDialog}
            />
        )
    }
}

const mapStateToProps = (state: StoreState): StateProps => ({
    user: selectUserData(state),
    myProducts: selectMyProductList(state),
    isFetchingMyProducts: selectFetchingMyProductList(state),
    myPurchases: selectMyPurchaseList(state),
    isFetchingMyPurchases: selectFetchingMyPurchaseList(state),
})

const mapDispatchToProps = (dispatch: Function): DispatchProps => ({
    getUserData: () => dispatch(getUserData()),
    getMyProducts: () => dispatch(getMyProducts),
    getMyPurchases: () => dispatch(getMyPurchases),
    redirectToEditProduct: (id: ProductId) => dispatch(push(formatPath(links.products, id || '', 'edit'))),
    showPublishDialog: (product: Product) => {
        dispatch(showModal(PUBLISH, {
            product,
            redirectOnCancel: false,
        }))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(AccountPage)
