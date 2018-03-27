// @flow

import {Transaction} from '../utils/smartContract'

export type Hash = string
export type Address = string
export type Receipt = {}
export type Abi = Array<{}>

export type EthereumNetwork = {
    id: ?string,
    name: ?string
}

export type SmartContractCall = Promise<any>

export type SmartContractTransaction = Transaction

