import { Box, Center, Flex, Text } from '@chakra-ui/react';
import { RiFlowerLine } from 'react-icons/ri';

type LogoSize = 'sm' | 'md' | 'lg';

type LogoProps = {
	size?: LogoSize;
	/** Show only the icon mark, without the wordmark */
	iconOnly?: boolean;
};

const sizeConfig: Record<
	LogoSize,
	{
		boxSize: number;
		iconSize: number;
		radius: string;
		nameSize: string;
		subSize: string;
		gap: number;
	}
> = {
	sm: {
		boxSize: 7,
		iconSize: 4,
		radius: 'md',
		nameSize: 'sm',
		subSize: '2xs',
		gap: 2,
	},
	md: {
		boxSize: 10,
		iconSize: 5,
		radius: 'lg',
		nameSize: 'md',
		subSize: 'xs',
		gap: 2.5,
	},
	lg: {
		boxSize: 14,
		iconSize: 7,
		radius: 'xl',
		nameSize: 'xl',
		subSize: 'sm',
		gap: 3,
	},
};

const Logo = ({ size = 'md', iconOnly = false }: LogoProps) => {
	const config = sizeConfig[size];

	return (
		<Flex align="center" gap={config.gap} display="inline-flex">
			{/* Icon mark */}
			<Center
				w={config.boxSize}
				h={config.boxSize}
				borderRadius={config.radius}
				bgColor="primary.solid"
				flexShrink={0}
			>
				<Box
					as={RiFlowerLine}
					boxSize={config.iconSize}
					color="white"
					display="block"
				/>
			</Center>

			{/* Wordmark */}
			{!iconOnly && (
				<Flex direction="column" gap={0} lineHeight={1.1}>
					<Text
						fontFamily="heading"
						fontWeight="extrabold"
						fontSize={config.nameSize}
						color="fg"
						lineHeight={1.15}
					>
						Nature
					</Text>
					<Text
						fontFamily="body"
						fontWeight="medium"
						fontSize={config.subSize}
						color="primary.fg"
						letterSpacing="widest"
						textTransform="uppercase"
					>
						Urbaine
					</Text>
				</Flex>
			)}
		</Flex>
	);
};

export default Logo;
