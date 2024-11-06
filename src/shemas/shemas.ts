import z from "zod";
export const schemas = {
	loginSchema: z.object({
		email: z.string().email(),
		password: z.string().min(6),
	}),
	excelSchema: {
		HBL: {
			prop: "hbl",
			unique: true,
		},
		F_AFORO: {
			prop: "fecha_aforo",
			type: Date,
		},
		F_SALIDA: {
			prop: "fecha_traslado",
			type: Date,
		},
		F_ENTREGA: {
			prop: "fecha_entregado",
			type: Date,
		},
	},
};
