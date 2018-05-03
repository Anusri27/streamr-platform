// @flow

import React from 'react'

import Dialog from '../Dialog'
import style from './confirmnocoverimage.pcss'

export type Props = {
    onClose: () => void,
    onContinue: () => void,
}

const ConfirmNoCoverImageDialog = ({ onClose, onContinue }: Props) => (
    <Dialog
        contentClassName={style.content}
        onClose={onClose}
        actions={{
            cancel: {
                title: 'Cancel',
                onClick: onClose,
            },
            continue: {
                title: 'Continue',
                color: 'primary',
                onClick: () => {
                    onContinue()
                    onClose()
                },
            },
        }}
    >
        <NoCoverImageIcon className={style.noCoverImageIcon} />
        <p>
            It looks like you didn’t add a cover image to your product.<br />
            Are you sure you want to save it without one?
        </p>
    </Dialog>
)

function NoCoverImageIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="50" {...props}>
            <g fill="none" fillRule="evenodd">
                <g stroke="#CDCDCD" strokeLinejoin="round" strokeWidth="2">
                    <path d="M15.045 1.045H54.27v39.198H15.045zm.027 30.488H54.27" />
                    <path strokeLinecap="round" d="M31.981 44.599l24.802 4.356 6.172-35.148-4.356-.765" />
                    <path d="M42.267 16.289l-6.534 10.889L30.289 25l-4.355 6.533h21.777z" />
                    <path strokeLinecap="round" d="M32.467 15.745l-4.355 2.722-4.356-2.722v-4.356l4.356-2.722 4.355 2.722z" />
                </g>
                <path
                    fill="#6240AF"
                    d="M12 46.693a1.503 1.503 0 0 1 0-3.007 1.503 1.503 0 1 1 0
                    3.007zm-1.2-11.125h2.4v7.216h-2.4v-7.216zM23.874 48.26l-10.8-21.648c-.407-.816-1.741-.816-2.148
                    0L.126 48.26A1.203 1.203 0 0 0 1.2 50h21.6a1.203 1.203 0 0 0 1.074-1.74z"
                />
            </g>
        </svg>
    )
}

export default ConfirmNoCoverImageDialog
