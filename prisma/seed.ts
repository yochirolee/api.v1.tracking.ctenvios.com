import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	try {
		// Clear existing locations first (optional)
		console.log("Clearing existing locations...");
		await prisma.location.deleteMany({});
		await prisma.status.deleteMany({});
		await prisma.role.deleteMany({});
		await prisma.user.deleteMany({});

		const locations = [
			{
				id: 1,
				name: "Agencia",
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
		const statuses = [
			{ id: 1, status: "FACTURADO", name: "Facturado" },
			{ id: 2, status: "EN_PALLET", name: "En Pallet" },
			{ id: 3, status: "EN_DESPACHO", name: "En Despacho" },
			{ id: 4, status: "EN_CONTENEDOR", name: "En Contenedor" },
			{ id: 5, status: "EN_ESPERA_DE_AFORO", name: "En Espera de Aforo" },
			{ id: 6, status: "AFORADO", name: "Aforado" },
			{ id: 7, status: "EN_TRASLADO", name: "En Traslado" },
			{ id: 8, status: "ENTREGADO", name: "Entregado" },
		];
		const roles = [
			{ id: 1, role: "SUPERADMIN", name: "Superadmin" },
			{ id: 2, role: "ADMIN", name: "Admin" },
			{ id: 3, role: "MANAGER", name: "Manager" },
			{ id: 4, role: "DRIVER", name: "Driver" },
			{ id: 5, role: "WAREHOUSE", name: "Warehouse" },
			{ id: 6, role: "USER", name: "User" },
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

		console.log("Seeding roles...");
		const createdRoles = await Promise.all(
			roles.map((role) =>
				prisma.role.create({
					data: role,
				}),
			),
		);

		console.log("Seeding user...");
		// Add user seeding
		const user = await prisma.user.create({
			data: {
				id: "42cbb03e-9d73-47a6-857e-77527c02bdc2",
				email: "yleecruz@gmail.com",
				password: "test",
				agencyId: 1,
				roleId: 1,
				name: "Yochiro Lee Cruz",

				// Add other required user fields here based on your schema
				// For example:
				// email: "example@example.com",
				// name: "Test User",
			},
		});

		console.log("Successfully seeded user");

		const createdStatuses = await Promise.all(
			statuses.map((status) =>
				prisma.status.create({
					data: status,
				}),
			),
		);

		console.log(`Successfully seeded ${createdStatuses.length} statuses`);
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
