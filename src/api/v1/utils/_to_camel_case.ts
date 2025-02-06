export function toCamelCase(value: string) {
	// Convert a string to camel case
	if (!value) return "";

	// Split by any number of spaces and remove empty elements
	return value
		.toLowerCase()
		.split(/\s+/)
		.filter((word) => word.length > 0)
		.map((word) => {
			// Capitalize first letter if word length > 1
			return word.length > 1 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
		})
		.join(" ");
}
