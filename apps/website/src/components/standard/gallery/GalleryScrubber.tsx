import { Box, chakra, Flex, Text } from '@chakra-ui/react';
import { type KeyboardEvent, type PointerEvent, useRef, useState } from 'react';
import PictureImg from '@/components/standard/PictureImg';
import type { GalleryImage } from './GalleryLightbox';

type GalleryScrubberProps = {
	images: GalleryImage[];
	current: number;
	onJump: (index: number) => void;
};

const PAGE_STEP = 10;
const PREVIEW_WIDTH = 104;
/** Up to this many photos, each stop gets a visible mark on the rail. */
const MAX_MARKS = 24;

type Hover = { index: number; x: number };

/**
 * The gallery's position indicator, from 2 photos to 200+: a progress rail
 * with a knob (one stop per photo, first at 0 %, last at 100 %), exposed as a
 * slider to assistive tech and the keyboard (arrows, Page Up/Down by 10,
 * Home/End). Short galleries also show a mark per stop. Hovering or dragging
 * previews the thumbnail under the pointer; the jump happens on release, so
 * dragging across 200 photos never scrolls the carousel through all of them.
 * Rail, fill and knob change state without transitions: none of them is in
 * DESIGN.md's allowed-motion table.
 */
const GalleryScrubber = ({ images, current, onJump }: GalleryScrubberProps) => {
	const count = images.length;
	const railRef = useRef<HTMLDivElement | null>(null);
	const [hover, setHover] = useState<Hover | null>(null);
	const [dragging, setDragging] = useState(false);

	const stopAt = (index: number) =>
		count > 1 ? (index / (count - 1)) * 100 : 0;
	const progress = stopAt(current);
	const digits = String(count).length;
	const hovered = hover ? images[hover.index] : null;

	const hoverAt = (clientX: number): Hover | null => {
		const rail = railRef.current;
		if (!rail) return null;
		const rect = rail.getBoundingClientRect();
		const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
		const index = Math.round(ratio * (count - 1));
		const half = PREVIEW_WIDTH / 2;
		return {
			index,
			// Over the stop, kept inside the rail's box.
			x: Math.min(
				Math.max((stopAt(index) / 100) * rect.width, half),
				rect.width - half,
			),
		};
	};

	const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragging(true);
		setHover(hoverAt(event.clientX));
	};

	const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType !== 'mouse' && !dragging) return;
		setHover(hoverAt(event.clientX));
	};

	const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
		if (!dragging) return;
		setDragging(false);
		const target = hoverAt(event.clientX);
		if (target) onJump(target.index);
		if (event.pointerType !== 'mouse') setHover(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const next = {
			ArrowRight: current + 1,
			ArrowUp: current + 1,
			ArrowLeft: current - 1,
			ArrowDown: current - 1,
			PageUp: current + PAGE_STEP,
			PageDown: current - PAGE_STEP,
			Home: 0,
			End: count - 1,
		}[event.key];
		if (next === undefined) return;
		event.preventDefault();
		onJump(Math.min(Math.max(next, 0), count - 1));
	};

	const active = dragging || hover !== null;

	return (
		<Flex align="center" gap={4}>
			<chakra.div
				role="slider"
				tabIndex={0}
				aria-label="Choisir une photo"
				aria-valuemin={1}
				aria-valuemax={count}
				aria-valuenow={current + 1}
				aria-valuetext={`Photo ${current + 1} sur ${count}`}
				onKeyDown={onKeyDown}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={() => {
					setDragging(false);
					setHover(null);
				}}
				onPointerLeave={() => {
					if (!dragging) setHover(null);
				}}
				position="relative"
				flex={1}
				minW={0}
				py={2.5}
				cursor="pointer"
				touchAction="pan-y"
				userSelect="none"
				borderRadius="full"
				_focusVisible={{
					outline: '2px solid',
					outlineColor: 'primary.solid',
					outlineOffset: '2px',
				}}
			>
				<Box
					ref={railRef}
					position="relative"
					h={active ? '6px' : '3px'}
					borderRadius="full"
					bgColor="border"
				>
					<Box
						position="absolute"
						insetBlock={0}
						insetStart={0}
						w={`${progress}%`}
						borderRadius="full"
						bgColor="primary.solid"
					/>
					{count <= MAX_MARKS
						? images.map((image, index) => (
								<Box
									key={image.id}
									position="absolute"
									top="50%"
									left={`${stopAt(index)}%`}
									boxSize="5px"
									borderRadius="full"
									bgColor={index <= current ? 'primary.solid' : 'fg.subtle'}
									transform="translate(-50%, -50%)"
								/>
							))
						: null}
					<Box
						position="absolute"
						top="50%"
						left={`${progress}%`}
						boxSize="12px"
						borderRadius="full"
						bgColor="primary.solid"
						borderWidth="2px"
						borderColor="bg"
						transform="translate(-50%, -50%)"
					/>
				</Box>
				{hover && hovered ? (
					<Box
						aria-hidden
						position="absolute"
						bottom="calc(100% + 6px)"
						left={`${hover.x}px`}
						transform="translateX(-50%)"
						w={`${PREVIEW_WIDTH}px`}
						p={1}
						bgColor="bg"
						borderWidth="1px"
						borderColor="border"
						borderRadius="md"
						shadow="md"
						pointerEvents="none"
						zIndex={2}
					>
						<Box aspectRatio={4 / 3} borderRadius="sm" overflow="hidden">
							<PictureImg
								source={hovered.thumbnail}
								alt=""
								priority
								bgColor="bg.subtle"
							/>
						</Box>
						<Text
							textStyle="mono.s"
							color="fg.muted"
							textAlign="center"
							mt={1}
							fontVariantNumeric="tabular-nums"
						>
							{hover.index + 1}
						</Text>
					</Box>
				) : null}
			</chakra.div>
			<Text
				textStyle="mono.s"
				color="fg.muted"
				whiteSpace="nowrap"
				fontVariantNumeric="tabular-nums"
			>
				{String(current + 1).padStart(digits, '0')} / {count}
			</Text>
		</Flex>
	);
};

export default GalleryScrubber;
