export function MessageWithBreaks({ value }: { value: string }) {
	const lines = value.split('\n');

	return (
		<>
			{lines.map((line, index) => (
				<span key={`${line}-${index}`}>
					{line}
					{index < lines.length - 1 ? <br /> : null}
				</span>
			))}
		</>
	);
}
