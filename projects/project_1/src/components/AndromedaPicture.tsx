interface AndromedaPictureProps {
  darkSrc: string;
  lightSrc: string;
  label: string;
  className?: string;
  imgClassName?: string;
  objectPosition?: string;
}

export function AndromedaPicture({
  darkSrc,
  lightSrc,
  label,
  className = '',
  imgClassName = '',
  objectPosition,
}: AndromedaPictureProps) {
  const posStyle = objectPosition ? { objectPosition } : undefined;

  return (
    <div
      role="img"
      aria-label={label}
      data-slot="andromeda-pic"
      className={`andromeda-pic ${className}`.trim()}
    >
      <img
        src={darkSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        style={posStyle}
        className={`andromeda-pic-img andromeda-pic-dark ${imgClassName}`.trim()}
      />
      <img
        src={lightSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        style={posStyle}
        className={`andromeda-pic-img andromeda-pic-light ${imgClassName}`.trim()}
      />
    </div>
  );
}
