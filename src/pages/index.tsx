import { Heading } from "@chakra-ui/react";
import Head from "next/head";

export default function Home() {
	return (
		<>
			<Head>
				<title>Nature Urbaine</title>
				<meta content="Bienvenue sur Nature Urbaine" name="description" />
				<link href="/favicon.ico" rel="icon" />
			</Head>
			<main>
				<Heading>Main page</Heading>
			</main>
		</>
	);
}
