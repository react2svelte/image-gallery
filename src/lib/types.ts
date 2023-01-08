export type Direction = 'left' | 'right';
export type Position = 'top' | 'bottom' | 'left' | 'right';
export type MouseOrKeyboard = 'mouse' | 'keyboard';
export type LoadingStrategy = 'eager' | 'lazy';

export type TImage = {
  srcSet: string;
  media: string;
};

export type TImageSet = TImage[];

export type TItem = Partial<{
  bulletClass: string;
  description: string;
  original: string;
  originalHeight: number;
  originalWidth: number;
  loading: LoadingStrategy;
  thumbnailHeight: number;
  thumbnailWidth: number;
  thumbnailLoading: LoadingStrategy;
  fullscreen: string;
  originalAlt: string;
  originalTitle: string;
  thumbnail: string;
  thumbnailAlt: string;
  thumbnailLabel: string;
  thumbnailTitle: string;
  originalClass: string;
  thumbnailClass: string;
  imageSet: TImageSet[];
  srcset: string;
  sizes: string;
}>;
