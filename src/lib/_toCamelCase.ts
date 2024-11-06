export function toCamelCase(value: String) {
	// Convert a string to camel case
	if (!value) return "";

	return value
		.toLowerCase()
		.split(" ")
		.map((word, index) => {
			// Capitalize the first letter of each word except the first one
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}
