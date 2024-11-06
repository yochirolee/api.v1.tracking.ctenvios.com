import axios from "axios";

interface SMSNotification {
	phoneNumber: string;
	message: string;
}

const SIMPLETEXT_API_KEY = process.env.SIMPLETEXT_API_KEY;
const SIMPLETEXT_API_URL = "https://api-app2.simpletexting.com/v2/api/messages";

async function sendSMSNotification({ phoneNumber, message }: SMSNotification): Promise<void> {
	try {
		const response = await axios.post(
			SIMPLETEXT_API_URL,
			{
				contactPhone: phoneNumber,
				text: message,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${SIMPLETEXT_API_KEY}`
				},
			},
		);
console.log(response)
		if (response.status===201) {
			console.log(`SMS sent successfully to ${phoneNumber}`);
		} else {
			console.error(`Failed to send SMS to ${phoneNumber}: ${response.data.id, response.data.credits}`);
		}
	} catch (error) {
		console.error(`Error sending SMS to ${phoneNumber}:`, error);
		throw new Error("Failed to send SMS notification");
	}
}

export async function notifyPackageUpdate(
	phoneNumber: string,
	packageId: string,
	newStatus: string,
	newLocation: string,
): Promise<void> {
	const message = `CTEnvios Tracking Actualizado el ${new Date().toLocaleString()} Total:2549 Entregados:2502 En traslado:47 Aforados:0`;
	await sendSMSNotification({ phoneNumber, message });
}
