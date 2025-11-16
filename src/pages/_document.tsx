import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html suppressHydrationWarning>
			<Head>
				<title>Nature Urbaine</title>
				<meta
					content="Nature Urbaine - Explore the beauty of urban nature through our reports and interviews."
					name="description"
				/>
				<link href="/favicon.ico" rel="icon" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
