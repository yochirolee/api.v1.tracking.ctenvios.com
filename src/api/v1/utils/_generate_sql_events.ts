export const generateMySqlEvents = (search_on_mysql: any) => {
	const events = [];
	if (search_on_mysql?.invoiceDate) {
		events.push({
			timestamp: search_on_mysql.invoiceDate,
			status: {
				id: 1,
				name: "Created",
				code: "CREATED",
				description: "Shipment created in Agency",
			},
			updateMethod: "SYSTEM",
		});
	}
	if (search_on_mysql?.dispatchDate) {
		events.push({
			timestamp: search_on_mysql.dispatchDate,

			status: {
				id: 2,
				name: "Dispatch ",
				code: "IN_WAREHOUSE",
				description:
					"Dispatch " +
					(search_on_mysql?.dispatchStatus === 1 ? "Created" : "Received") +
					" " +
					search_on_mysql.dispatchId,
			},
			updateMethod: "SYSTEM",
		});
	}
	if (search_on_mysql?.palletDate) {
		events.push({
			timestamp: search_on_mysql.palletDate,

			status: {
				id: 2,
				description: "In Warehouse in Pallet " + search_on_mysql.palletId,
				code: "IN_WAREHOUSE",
				name: "In Warehouse in Pallet",
			},
			updateMethod: "SYSTEM",
		});
	}
	if (search_on_mysql?.containerDate) {
		events.push({
			timestamp: search_on_mysql.containerDate,

			location: "Contenedor",
			status: {
				id: 3,
				name: "In Container",
				code: "IN_CONTAINER",
				description: search_on_mysql?.containerName + " - " + search_on_mysql.containerId,
			},
			updateMethod: "SYSTEM",
		});
	}
	return events;
};


