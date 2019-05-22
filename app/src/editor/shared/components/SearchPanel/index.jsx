import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import cx from 'classnames'
import Draggable from 'react-draggable'
import { ResizableBox } from 'react-resizable'
import SvgIcon from '$shared/components/SvgIcon'

import styles from './SearchPanel.pcss'

export function SearchRow({ className, ...props }) {
    return (
        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
        <div
            className={cx(styles.SearchRow, className)}
            role="option"
            aria-selected="false"
            tabIndex="0"
            {...props}
        />
    )
}

function MaybeDraggable({ disabled, children, ...props }) {
    if (disabled) { return children || null }
    return (
        <Draggable {...props}>
            {children}
        </Draggable>
    )
}

export function SearchPanel(props) {
    const {
        open,
        isOpen,
        bounds,
        placeholder,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        children,
        className,
        scrollPadding,
        dragDisabled,
        headerHidden,
        renderDefault,
    } = props

    const [search, setSearch] = useState('')
    const [isExpanded, setExpanded] = useState(true)
    const [hasFocus, setHasFocus] = useState(false)
    const [layout, setLayoutState] = useState({
        preferredHeight: props.defaultHeight,
        width: props.defaultWidth,
        height: props.defaultHeight,
        posX: props.defaultPosX,
        posY: props.defaultPosY,
    })

    const setLayout = useCallback((next = {}) => {
        setLayoutState((prev) => Object.assign({}, prev, next))
    }, [setLayoutState])

    const contentRef = useRef()
    const inputRef = useRef()
    const scrollContainerRef = useRef()

    const onKeyDown = useCallback((event) => {
        if (isOpen && event.key === 'Escape' && hasFocus) {
            open(false)
        }
    }, [isOpen, hasFocus, open])

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [onKeyDown])

    const onChange = (event) => {
        const { value } = event.currentTarget
        setSearch(value)
    }

    const clear = () => {
        setSearch('')
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const prevSearch = useRef(search)
    const { width, height, posX, posY } = layout
    const isSearching = !!search.trim()

    const onChangeProp = props.onChange
    useEffect(() => {
        if (onChangeProp && search !== prevSearch.current) {
            onChangeProp(search)
        }
        prevSearch.current = search
    }, [onChangeProp, search])

    useEffect(() => {
        // focus input on open
        if (isOpen) {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }
    }, [isOpen, inputRef])

    const toggleMinimize = () => (
        setExpanded((isExpanded) => !isExpanded)
    )

    const onInputFocus = useCallback((event) => {
        // select input text on focus
        event.currentTarget.select()
        setHasFocus(true)
    }, [setHasFocus])

    const onInputBlur = useCallback(() => {
        setHasFocus(false)
    }, [setHasFocus])

    const onDragStop = useCallback((e, data) => {
        setLayoutState((layout) => {
            if (data.x === layout.posX && data.y === layout.posY) {
                return layout // do nothing if identical
            }
            return {
                ...layout,
                posX: data.x,
                posY: data.y,
            }
        })
    }, [setLayoutState])

    const onResizeStart = useCallback(() => {
        setLayout({
            resizing: true,
        })
    }, [setLayout])

    const onResizeStop = useCallback((e, data) => {
        setLayout({
            resizing: false,
            height: data.size.height, // needs to be set otherwise height won't reset to autosize on stop
            width: data.size.width,
            preferredHeight: data.size.height,
        })
    }, [setLayout])

    useLayoutEffect(() => {
        if (layout.resizing) { return } // do nothing while resizing

        const { current: currentContent } = contentRef
        const itemsHeight = currentContent ? currentContent.offsetHeight : minHeight
        const requiredHeight = minHeight + (itemsHeight ? scrollPadding + itemsHeight : 0)

        setLayoutState((layout) => {
            const { preferredHeight } = layout
            let { height } = layout
            if (!isSearching) {
                // when no search show at either min or preferredHeight height
                height = isExpanded ? layout.preferredHeight : minHeight
            } else {
                // autosize search
                height = Math.min(Math.max(minHeight, requiredHeight), preferredHeight)
            }

            if (height === layout.height) {
                return layout // noop if same
            }

            return {
                ...layout,
                height,
            }
        })
    }, [layout, contentRef, setLayoutState, children, isSearching, minHeight, scrollPadding, isExpanded])

    return (
        <React.Fragment>
            <MaybeDraggable
                disabled={dragDisabled}
                handle={`.${styles.dragHandle}`}
                bounds={bounds}
                position={{
                    x: posX,
                    y: posY,
                }}
                onStop={onDragStop}
            >
                <div
                    className={cx(styles.SearchPanel, className, {
                        [styles.isSearching]: isSearching,
                        [styles.isExpanded]: isExpanded,
                    })}
                    hidden={!isOpen}
                    ref={props.panelRef}
                >
                    <ResizableBox
                        className={styles.ResizableBox}
                        width={Math.min(width, maxWidth)}
                        height={height}
                        minConstraints={[minWidth, minHeight]}
                        maxConstraints={[maxWidth, maxHeight]}
                        onResizeStop={onResizeStop}
                        onResizeStart={onResizeStart}
                    >
                        <div className={styles.Container}>
                            {!headerHidden && (
                                <div className={cx(styles.Header, styles.dragHandle)}>
                                    <button type="button" className={styles.minimize} onClick={toggleMinimize}>
                                        {isExpanded ?
                                            <SvgIcon name="brevetDown" className={styles.flip} /> :
                                            <SvgIcon name="brevetDown" className={styles.normal} />
                                        }
                                    </button>
                                    <button type="button" className={styles.close} onClick={() => open(false)}>
                                        <SvgIcon name="x" />
                                    </button>
                                </div>
                            )}
                            <div className={styles.Input}>
                                <input
                                    ref={inputRef}
                                    placeholder={placeholder}
                                    value={search}
                                    onChange={onChange}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                                <button
                                    type="button"
                                    className={styles.ClearButton}
                                    onClick={clear}
                                    hidden={search === ''}
                                >
                                    <SvgIcon name="clear" />
                                </button>
                            </div>
                            {/* eslint-disable-next-line max-len */}
                            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
                            <div
                                className={styles.ContentContainer}
                                style={{
                                    paddingBottom: `${scrollPadding}px`,
                                }}
                                onClick={() => {
                                    // quick hack to force recalculation of height on child expansion/collapse
                                    setLayout({})
                                }}
                                ref={scrollContainerRef}
                            >
                                <div ref={contentRef} role="listbox" className={styles.Content}>
                                    {(() => {
                                        // empty content if not searching and not expanded
                                        if (!isSearching && !isExpanded) { return null }
                                        // show default if not searching and expanded
                                        if (!isSearching && isExpanded && renderDefault) { return renderDefault() }
                                        // show children otherwise
                                        return children
                                    })()}
                                </div>
                            </div>
                        </div>
                    </ResizableBox>
                </div>
            </MaybeDraggable>
        </React.Fragment>
    )
}

const DEFAULT_HEIGHT = 352

SearchPanel.defaultProps = {
    bounds: 'parent',
    minWidth: 250,
    defaultWidth: 250,
    maxWidth: 600,
    defaultHeight: DEFAULT_HEIGHT,
    maxHeight: DEFAULT_HEIGHT * 2,
    minHeight: 91,
    scrollPadding: 0,
    defaultPosX: 32,
    defaultPosY: (window.innerHeight / 2) - (DEFAULT_HEIGHT / 2) - 80, // center vertically (take header into account)
}

export default SearchPanel
