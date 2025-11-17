import { Box, Container } from "@chakra-ui/react";
import type { AppType } from "next/app";
import { Manrope } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

const manrope = Manrope({
	subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<Provider>
			<Box bg="bg.subtle" className={manrope.className} minH="100vh">
				<Navbar />
				<Container as="main" maxW="container.lg" py={8}>
					<Component {...pageProps} />
				</Container>
			</Box>
		</Provider>
	);
};

export default api.withTRPC(MyApp);
