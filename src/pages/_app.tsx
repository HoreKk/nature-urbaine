import { Container } from "@chakra-ui/react";
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
		<div className={manrope.className}>
			<Provider>
				<Navbar />
				<Container as="main" maxW="container.lg" py={6}>
					<Component {...pageProps} />
				</Container>
			</Provider>
		</div>
	);
};

export default api.withTRPC(MyApp);
