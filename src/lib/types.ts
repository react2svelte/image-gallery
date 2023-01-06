export type Direction = 'left' | 'right';
export type Position = 'top' | 'bottom' | 'left' | 'right';

export type TImage = {
  srcSet: string;
  media: string;
};

export type TImageSet = TImage[];

export type TItem = Partial<{
  bulletClass: string;
  bulletOnClick: Function;
  description: string;
  original: string;
  originalHeight: number;
  originalWidth: number;
  loading: 'eager' | 'lazy';
  thumbnailHeight: number;
  thumbnailWidth: number;
  thumbnailLoading: 'eager' | 'lazy' | undefined;
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
  imageSet: TImageSet[];
  renderThumbInner: Function;
  srcset: string;
  sizes: string;
}>;
