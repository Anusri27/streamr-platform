import React, { useState, useCallback, useMemo, useRef, useContext, useLayoutEffect } from 'react'
import uniqueId from 'lodash/uniqueId'

/*
 * Provides a constant uid for a component
 * Takes one more more prefixes for debuggability
 */

function useId(...prefixes) {
    const idRef = useRef()
    if (!idRef.current) {
        let prefix = prefixes.join('.')
        // add trailing e.g. a.b => a.b. => a.b.123
        prefix = prefix ? `${prefix}.` : undefined
        idRef.current = uniqueId(prefix)
    }

    return idRef.current
}

export const OPTION_SELECTOR = '[role=option]:not([aria-disabled])'

const ListContext = React.createContext()

/* eslint-disable object-curly-newline */
export function ListOption({
    disabled = false,
    refName = 'ref', // support alternative ref props, e.g. innerRef
    component = 'div', // support dynamic component e.g. a, Link
    ...props
}) {
    /* eslint-enable object-curly-newline */
    const elRef = useRef()
    const Component = component
    const listContext = useContext(ListContext)
    const parentId = listContext.id
    const id = useId(parentId, 'ListOption')
    const { setSelected } = listContext
    const onFocus = useCallback(() => {
        setSelected(id)
    }, [id, setSelected])

    // focus on mousemove
    // mouseover no good as items can move
    const onMouseMove = useCallback((event) => {
        if (event.currentTarget !== event.target) { return } // ignore bubbled
        setSelected(id)
    }, [setSelected, id])

    /* treat enter/spacebar as onClick */
    const onKeyDown = useCallback((event) => {
        if (!elRef.current) { return }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            elRef.current.click()
        }
    }, [elRef])

    const [isSelected, setIsSelected] = useState(listContext.isSelected(id))
    // need to reconfigure isSelected state after render
    // otherwise it will be reading element ordering from the stale list
    useLayoutEffect(() => {
        const nextIsSelected = listContext.isSelected(id)
        // do nothing if no change
        if (nextIsSelected === isSelected) { return }

        if (!nextIsSelected) {
            // ensure blurred when selectedIndex leaves element
            elRef.current.blur()
        } else {
            // ensure scrolled into view when selected
            elRef.current.scrollIntoView({
                behavior: 'smooth',
                scrollMode: 'if-needed',
                block: 'nearest',
                inline: 'nearest',
            })
        }

        setIsSelected(nextIsSelected)
    }, [setIsSelected, listContext, isSelected, id])

    const refProp = {
        [refName]: elRef, // dynamic ref
    }

    return (
        <Component
            id={id}
            role="option"
            aria-disabled={disabled || undefined}
            aria-selected={String(isSelected)}
            {...refProp}
            {...(disabled ? {} : {
                // only enable interaction if not disabled
                tabIndex: -1,
                onKeyDown,
                onFocus,
                onMouseMove,
            })}
            {...props}
        />
    )
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
}

export const ListBox = React.forwardRef(({ listContextRef, ...props }, ref) => {
    // ListBox needs unique id so ListOptions can have ListBox-scoped ids
    // So aria-activedescendant={selectedId} is valid
    const id = useId('ListBox')

    const [selectedIndex, setSelectedState] = useState(0)

    /**
     * Move selectedIndex forward or backwards with wrap around.
     */
    const adjustSelectedIndex = useCallback((amount = 0) => {
        if (!ref.current) { return }
        const options = ref.current.querySelectorAll(OPTION_SELECTOR)
        setSelectedState((index) => {
            // ensure movement relative to current list bounds
            index = clamp(index, 0, options.length)
            // starting at options.length enables backwards wrap around
            return (options.length + index + amount) % options.length
        })
    }, [setSelectedState, ref])

    const selectNext = useCallback(() => {
        adjustSelectedIndex(1)
    }, [adjustSelectedIndex])

    const selectPrev = useCallback(() => {
        adjustSelectedIndex(-1)
    }, [adjustSelectedIndex])

    const [selectedEl, setSelectedEl] = useState()

    /**
     * Finds element matching selected index
     */
    const getSelectedEl = useCallback(() => {
        if (!ref.current) { return }
        const options = ref.current.querySelectorAll(OPTION_SELECTOR)
        return options[clamp(selectedIndex, 0, options.length - 1)]
    }, [ref, selectedIndex])

    /**
     * True if id matches selected element
     */
    const isSelected = useCallback((id) => {
        const el = getSelectedEl()
        const isSelectedEl = !!(el && el.id === id)
        // piggy back on this to also set the selected el
        if (isSelectedEl && el !== selectedEl) {
            setSelectedEl(el)
        }
        return isSelectedEl
    }, [setSelectedEl, selectedEl, getSelectedEl])

    /**
     * Maps passed-in id to index in options collection
     * Sets as selected index, or 0 if not found.
     */
    const setSelected = useCallback((id) => {
        const options = Array.from(ref.current.querySelectorAll(OPTION_SELECTOR))
        const ids = options.map((el) => el.id)
        const selectedIndex = ids.indexOf(id)
        setSelectedState(clamp(selectedIndex, 0, ids.length))
    }, [ref, setSelectedState])

    /**
     * Keyboard handling for when listbox is focused
     */
    const onKeyDown = useCallback((event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            selectNext()
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault()
            selectPrev()
        }
    }, [selectNext, selectPrev])

    /**
     * Build list context API
     */
    const listContext = useMemo(() => ({
        id,
        selectedIndex,
        isSelected,
        selectPrev,
        selectNext,
        setSelected,
        getSelectedEl,
    }), [
        id,
        selectedIndex,
        isSelected,
        selectPrev,
        selectNext,
        setSelected,
        getSelectedEl,
    ])

    /**
     * Provide ref to context API for parent to control
     */
    if (listContextRef) {
        listContextRef.current = listContext
    }

    return (
        <ListContext.Provider value={listContext}>
            <div
                id={id}
                tabIndex="0"
                role="listbox"
                ref={ref}
                aria-activedescendant={selectedEl && selectedEl.id}
                onKeyDown={onKeyDown}
                {...props}
            />
        </ListContext.Provider>
    )
})

