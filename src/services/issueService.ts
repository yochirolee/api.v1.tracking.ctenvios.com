import { PrismaClient, Issue } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllIssues = async (): Promise<Issue[]> => {
	return prisma.issue.findMany();
};

export const getIssueById = async (id: string): Promise<Issue | null> => {
	return prisma.issue.findUnique({ where: { id } });
};

export const createIssue = async (
	data: Omit<Issue, "id" | "createdAt" | "resolvedAt">,
): Promise<Issue> => {
	return prisma.issue.create({ data });
};

export const updateIssue = async (
	id: string,
	data: Partial<Omit<Issue, "id" | "createdAt">>,
): Promise<Issue | null> => {
	return prisma.issue.update({ where: { id }, data });
};

export const deleteIssue = async (id: string): Promise<Issue | null> => {
	return prisma.issue.delete({ where: { id } });
};

export const getIssuesByParcelId = async (id: string): Promise<Issue[]> => {
	return prisma.issue.findMany({
		where: { id },
		orderBy: { createdAt: "desc" },
	});
};
