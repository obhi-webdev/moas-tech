function Image({
  src,
  fill,
  priority,
  unoptimized,
  style,
  alt,
  ...props
}) {
  const source = typeof src === "string" ? src : src.src;
  return <img
    src={source}
    alt={alt || ""}
    style={{
      ...fill ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover"
      } : {},
      ...style
    }}
    loading={priority ? "eager" : "lazy"}
    {...props}
  />;
}
export {
  Image as default
};
