import * as React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { Canvas } from './Canvas'

export function App() {
    const refContainer = React.useRef()
    const [{width, height}, setSize] = React.useState({width: 0, height: 0})
    React.useLayoutEffect(() => {
        const element = refContainer.current
        if (!element) return
        const resizeObserver = new ResizeObserver(entries => {
            if (!Array.isArray(entries) || !entries.length) {
                return
            }
            const entry = entries[0]
            setSize({width: Math.floor( entry.contentRect.width), height: Math.floor(entry.contentRect.height)})
        })
        resizeObserver.observe(element)
        return () => {
            resizeObserver.unobserve(element)
        }
    }, [])

    return (
        <div style={{display: 'flex', width: '100%', height: '100%', flexDirection: 'column'}}>
            <header style={{flex: 'none'}}>
                <h1>Test !</h1>
            </header>
            <main ref={refContainer} style={{display: 'flex', flex: '1'}}>
                {!!width && !!height && (
                    <Canvas width={width} height={height}>
                        <Rectangle />
                    </Canvas>
                )}
            </main>
        </div>
    )
}

function Rectangle() {
    return (
        // @ts-ignore
        <view style={{
            width: 160,
            height: 80,
            backgroundColor: "yellow",
            justifyContent: "center",
            // @ts-ignore
            transform: {
                matrix: [1, 0, 0, 1, 50, 40],
            },
            padding: 5,
        }}>
            <view style={{
                flex: 1,
                backgroundColor: "green",
            }}/>
        </view>
    )
}