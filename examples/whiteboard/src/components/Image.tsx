import { createAsset } from "use-asset";
import * as React from "react";

const imageAsset = createAsset((src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      image.onload = null;
      image.onerror = null;
      resolve(image);
    };
    image.onerror = () => {
      image.onload = null;
      image.onerror = null;
      reject();
    };
    image.src = src;
  });
});

export function Image({
  src,
  ...props
}: Omit<JSX.IntrinsicElements["c-image"], "image"> & { src: string }) {
  const image = imageAsset.read(src);
  return <c-image image={image} {...props} />;
}
