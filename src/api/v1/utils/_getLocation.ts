import axios from "axios";

export const getLocation = async (lat: number, loc: number) => {
	try {
		const response = await axios.get(
			`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${loc}&format=json`,
		);
		return response.data;
	} catch (err) {
		console.error(err);
	}
};
