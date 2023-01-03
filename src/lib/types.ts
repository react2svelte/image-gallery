export type Image = {
  srcSet: string;
  media: string;
};

export type ImageSet = Image[];

export type Item = {
  bulletClass: string;
  bulletOnClick: Function;
  description: string;
  original: string;
  originalHeight: number;
  originalWidth: number;
  loading: string;
  thumbnailHeight: number;
  thumbnailWidth: number;
  thumbnailLoading: string;
  fullscreen: string;
  originalAlt: string;
  originalTitle: string;
  thumbnail: string;
  thumbnailAlt: string;
  thumbnailLabel: string;
  thumbnailTitle: string;
  originalClass: string;
  thumbnailClass: string;
  renderItem: Function;
  imageSet: ImageSet[];
  renderThumbInner: Function;
  srcSet: string;
  sizes: string;
};
