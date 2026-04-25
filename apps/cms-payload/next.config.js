import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	devIndicators: false,
	transpilePackages: ["@nature-urbaine/database"],
	experimental: {
		optimizePackageImports: ["@chakra-ui/react"],
	},
};

export default withPayload(config);
