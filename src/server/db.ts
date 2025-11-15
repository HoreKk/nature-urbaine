import { getPayload } from "payload";
import payloadConfig from "~/payload.config";

const createPayloadClient = async () =>
	await getPayload({
		config: payloadConfig
	});

const globalForPayload = globalThis as unknown as {
	payload: ReturnType<typeof createPayloadClient> | undefined;
};

export const db = globalForPayload.payload ?? createPayloadClient();
if (process.env.NODE_ENV !== "production") globalForPayload.payload = db;