// @flow

import React from 'react'
import { Row, Container, Col } from '@streamr/streamr-layout'
import type { ProductList, Product } from '../../flowtype/product-types'
import type { Props } from '../ProductTile'
import ProductTile from '../ProductTile'
import LoadMore from '../LoadMore'
import Error from '../Error'
import { getTileProps, getErrorView, getCols } from './settings'
import styles from './products.pcss'

export type ProductTilePropType = "myProducts" | "myPurchases" | "products"
export type ProductTileProps = $Rest<Props, {|source: Product|}>

export type OwnProps = {
    products: ProductList,
    type: ProductTilePropType,
    error?: any,
    isFetching?: boolean,
    loadProducts?: () => void,
    hasMoreSearchResults?: boolean,
}

const listProducts = (products, cols, productTileProps: ProductTileProps) => (
    <Row >
        {products.map((product) => (
            <Col {...cols} key={product.key || product.id} >
                <ProductTile
                    {...productTileProps}
                    source={product}
                />
            </Col>
        ))}
    </Row>
)

const Products = ({
    products,
    type,
    error,
    isFetching,
    loadProducts,
    hasMoreSearchResults,
}: OwnProps) => (
    <Container className={styles.container}>
        <Error source={error} />
        {(products.length > 0 && listProducts(products, getCols(type), getTileProps(type))) || getErrorView(type)}
        {loadProducts && <LoadMore
            isFetching={!!isFetching}
            onClick={loadProducts}
            hasMoreSearchResults={!!hasMoreSearchResults}
        />}
    </Container>
)

export default Products
