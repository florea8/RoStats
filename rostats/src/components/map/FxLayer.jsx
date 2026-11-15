import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { startCanvasLoop } from '../../utils/canvasLoop'
import { reducedMotion } from '../../utils/motion'
import { SCENES } from './scenes'

/**
 * Canvas over the map on which the active section's scene is animated
 * (see scenes.js). It follows the map as it is dragged and flown; during a
 * button or wheel zoom, when Leaflet scales the old view, it steps aside.
 *
 * scene:    key of SCENES
 * data:     what the scene reads each frame; may change without restarting it
 * replayId: changing it restarts the scene from the beginning
 */
export default function FxLayer({ scene, data, replayId }) {
  const map = useMap()
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  })

  useEffect(() => {
    if (reducedMotion() || !SCENES[scene]) return

    const canvas = L.DomUtil.create('canvas', 'mapFx', map.getContainer())
    const draw = SCENES[scene]()
    const project = latlng => map.latLngToContainerPoint(latlng)

    let scaling = false
    const pause = () => { scaling = true }
    const resume = () => { scaling = false }
    map.on('zoomanim', pause)
    map.on('zoomend', resume)

    const stop = startCanvasLoop(canvas, (ctx, frame) => {
      if (!scaling) draw(ctx, { ...frame, project, data: dataRef.current })
    })

    return () => {
      stop()
      map.off('zoomanim', pause)
      map.off('zoomend', resume)
      canvas.remove()
    }
  }, [map, scene, replayId])

  return null
}
