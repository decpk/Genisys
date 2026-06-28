interface MdImageProps {
  src?: string
  alt?: string
}

const IMG_CLASS = 'max-w-full rounded-lg my-3'

export function MdImage({ src, alt }: MdImageProps): React.JSX.Element {
  return <img src={src} alt={alt} className={IMG_CLASS} loading="lazy" />
}
