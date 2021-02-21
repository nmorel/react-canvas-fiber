import * as React from 'react'
import { CanvasRenderer } from './CanvasRenderer'

export function Canvas({width, height}) {
    const canvasRef = React.useRef<HTMLCanvasElement>()
    const rendererRef = React.useRef<CanvasRenderer>()
    React.useLayoutEffect(() => {
        if (!rendererRef.current) {
            rendererRef.current = new CanvasRenderer(canvasRef.current, {width, height})
        } else {
            rendererRef.current.updateDimensions({width, height})
        }
    }, [width, height])
    
    React.useLayoutEffect(() => () => {
        rendererRef.current?.dispose()
        rendererRef.current = null
    }, [])

    return <canvas ref={canvasRef} width={width} height={height} style={{width, height}}  />
}