import type { AppType } from "next/app";
import { Geist } from "next/font/google";
import { Provider } from "@/components/ui/provider";

import { api } from "~/utils/api";

const geist = Geist({
	subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<div className={geist.className}>
			<Provider>
				<Component {...pageProps} />
			</Provider>
		</div>
	);
};

export default api.withTRPC(MyApp);
