import { Image as ChakraImage, type ImageProps } from '@chakra-ui/react';
import type { ImageSource } from '@/utils/picture-src';

type PictureImgProps = Omit<ImageProps, 'src' | 'srcSet' | 'sizes' | 'alt'> & {
	source: ImageSource;
	alt: string;
	/** Above-the-fold hero: load eagerly instead of lazily. */
	priority?: boolean;
};

/**
 * Plain `<img>` with the attributes that actually save bandwidth: lazy
 * loading, async decoding, intrinsic dimensions (no layout shift) and an
 * optional `srcSet`. Chakra style props apply to the element via `asChild`.
 */
export const PictureImg = ({
	source,
	alt,
	priority = false,
	...chakraProps
}: PictureImgProps) => (
	<ChakraImage asChild objectFit="cover" w="full" h="full" {...chakraProps}>
		<img
			src={source.src}
			srcSet={source.srcSet}
			sizes={source.sizes}
			width={source.width}
			height={source.height}
			alt={alt}
			loading={priority ? 'eager' : 'lazy'}
			decoding="async"
		/>
	</ChakraImage>
);

export default PictureImg;
