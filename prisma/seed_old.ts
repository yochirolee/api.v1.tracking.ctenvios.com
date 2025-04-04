import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	try {
		// Clear existing locations first (optional)
		console.log("Clearing existing locations...");
		await prisma.location.deleteMany({});
		await prisma.user.deleteMany({});

		const locations = [
			{
				id: 1,
				name: "Agencia",
				description: "Agencia",
			},
			{
				id: 2,
				name: "Almacen",
				description: "Recibido en almacen",
			},
			{
				id: 3,
				name: "Contenedor",
				description: "En contenedor",
			},
			{
				id: 4,
				name: "Puerto del Mariel",
				description: "En Puerto del Mariel",
			},
			{
				id: 5,
				name: "Almacen Mypimes",
				description: "En Almacen Mypimes",
			},
			{
				id: 6,
				name: "En Traslado",
				description: "En Traslado",
			},
			{
				id: 7,
				name: "Entregado",
				description: "Destino Final",
			},
		];

		console.log("Starting to seed locations...");
		const createdLocations = await Promise.all(
			locations.map((location) =>
				prisma.location.create({
					data: location,
				}),
			),
		);

		console.log(`Successfully seeded ${createdLocations.length} locations`);

		console.log("Seeding user...");
		// Add user seeding
		const user = await prisma.user.create({
			data: {
				id: "42cbb03e-9d73-47a6-857e-77527c02bdc2",
				email: "yleecruz@gmail.com",
				password: bcrypt.hashSync("Audioslave*84", 10),
				agencyId: 1,
				role: "ROOT",
				name: "Yochiro Lee Cruz",
				createdById: "42cbb03e-9d73-47a6-857e-77527c02bdc2",
				

				// Add other required user fields here based on your schema
				// For example:
				// email: "example@example.com",
				// name: "Test User",
			},
		});

		console.log("Successfully seeded user");
	} catch (error) {
		console.error("Error seeding database:", error);
		throw error;
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
