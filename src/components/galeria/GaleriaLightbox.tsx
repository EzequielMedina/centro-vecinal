"use client"

import Lightbox from "yet-another-react-lightbox"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"

type Slide = {
  src: string
  alt?: string
}

type Props = {
  slides: Slide[]
  index: number
  onClose: () => void
}

export function GaleriaLightbox({ slides, index, onClose }: Props) {
  return (
    <Lightbox
      open
      index={index}
      slides={slides}
      close={onClose}
      plugins={[Thumbnails, Zoom]}
      carousel={{ finite: false }}
      thumbnails={{ position: "bottom" }}
    />
  )
}
