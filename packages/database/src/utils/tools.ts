import XLSX from "xlsx";

export function readExcelSheet(
	filePath: string,
	sheetName: string,
	headers?: string[],
) {
	try {
		const workbook = XLSX.readFile(filePath);

		const targetSheet = sheetName || workbook.SheetNames[0];
		if (!targetSheet)
			throw new Error("Aucune feuille disponible dans le fichier Excel");
		const sheet = workbook.Sheets[targetSheet];

		if (!sheet) {
			throw new Error(`Feuille "${sheetName}" introuvable`);
		}

		const data = XLSX.utils.sheet_to_json(sheet);
		const processedData = headers
			? data.map((row: any) => {
					const newRow: Record<string, any> = {};
					Object.values(row).forEach((value, colIndex) => {
						newRow[headers[colIndex] || `Column${colIndex}`] = value;
					});
					return newRow;
				})
			: data;

		console.log(
			`\n✓ ${data.length} lignes récupérées de la feuille "${sheetName || workbook.SheetNames[0]}"`,
		);

		return processedData;
	} catch (error) {
		console.error(
			"Erreur lors de la lecture du fichier:",
			error instanceof Error ? error.message : error,
		);
		return [];
	}
}
