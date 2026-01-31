import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default withPayload(config);
