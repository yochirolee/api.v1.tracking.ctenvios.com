import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { statusSeedData, agenciesSeedData } from "../src/api/v1/types/data";

const prisma = new PrismaClient();

async function main() {
	try {
		// Clear existing locations first (optional)

		await prisma.user.deleteMany({});
		console.log("Clearing existing users...");
		await prisma.agency.deleteMany({});
		console.log("Clearing existing agencies...");
		await prisma.status.deleteMany({});
		console.log("Clearing existing status...");

		 console.log("Seeding agencies...");
		//how to seed agencies from agencies.json?
		await prisma.agency.createMany({
			data: agenciesSeedData,
		}); 

		console.log("Seeding user...");
		// Add user seeding
		await prisma.user.create({
			data: {
				id: "42cbb03e-9d73-47a6-857e-77527c02bdc2",
				email: "yleecruz@gmail.com",
				password: bcrypt.hashSync("Audioslave*84", 10),
				agencyId: 2,
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

		console.log("Seeding status...");
		//Seeding Status
		await prisma.status.createMany({
			data: statusSeedData,
		});
		console.log("Successfully seeded status");
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
