import * as React from 'react'
import { CanvasRenderer } from './CanvasRenderer'
import { render } from './ReactCanvasReconciler'

export function Canvas({width, height, children}: {width: number, height: number, children: React.ReactElement}) {
    const canvasRef = React.useRef<HTMLCanvasElement>()
    const rendererRef = React.useRef<CanvasRenderer>()
    
    React.useLayoutEffect(() => {
            rendererRef.current?.updateDimensions({width, height})
    }, [width, height])

    React.useLayoutEffect(() => {
        if (!rendererRef.current) {
            rendererRef.current = new CanvasRenderer(canvasRef.current, {width, height})
        }
        return () => {
            rendererRef.current?.dispose()
            rendererRef.current = null
        }
    }, [])

    const onInitCompRef = React.useRef(null)
    if (!onInitCompRef.current) {
        onInitCompRef.current = function OnInit(props: { children: React.ReactElement }): JSX.Element {
            return props.children
        }
    }

    React.useLayoutEffect(() => {
        const OnInit = onInitCompRef.current
        render(
            <OnInit>{children}</OnInit>,
            rendererRef.current,
        )
    }, [children])

    return <canvas ref={canvasRef} width={width} height={height} style={{width, height}}  />
}

/*
react three fiber
targets/web.tsx => 
    main Canvas component
targets/shared/web/ResizeContainer => 
    creates the div container, render/creates the canvas element given by web.tsx
    get the size of the container using react-use-measure
    creates the webgl renderer calling the renderer method given by web.tsx
    calls useCanvas with the webgl renderer (gl) and the container sizes (props: children, gl, size, forceResize)
canvas.tsx => 
    init stuff
    call the custom react renderer with children
*/