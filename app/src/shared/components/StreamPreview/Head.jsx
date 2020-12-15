import styled from 'styled-components'
import { SM, LG, REGULAR } from '$shared/utils/styled'

const Inner = styled.div``

const Head = styled.div`
    flex: 0;
    margin-left: calc((100vw - var(--LiveDataInspectorWidth) - 1108px) / 2);
    position: relative;

    button + button {
        margin-left: 16px;
    }

    > ${Inner} {
        align-items: center;
        display: flex;
        height: 72px;

        h1 {
            font-size: 18px;
            font-weight: ${REGULAR};
            letter-spacing: 0.01em;
            line-height: normal;
            margin: 0;

            @media (min-width: ${LG}px) {
                font-size: 24px;
            }
        }

        h1 span:empty {
            display: none;
        }

        h1 span:not(:last-child)::after {
            content: '&rarr;';
            padding: 0 1em;
        }

        p {
            color: #a3a3a3;
            font-size: 12px;
            letter-spacing: 0.01em;
            line-height: normal;
            margin: 0;

            @media (min-width: ${LG}px) {
                font-size: 14px;
            }
        }

        p:empty {
            display: none;
        }

        @media (min-width: ${SM}px) {
            height: 56px;
        }

        @media (min-width: ${LG}px) {
            p {
                font-size: 14px;
            }
        }
    }
`

Head.Inner = Inner

export default Head
