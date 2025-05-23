import { Agency, Status } from "@prisma/client";

export const SHIPMENT_STATUSES = {
	// Initial States
	REGISTERED: {
		code: "CREATED",
		name: "Created",
		description: "Shipment has been registered in the system",
	},

	IN_WAREHOUSE: {
		code: "IN_WAREHOUSE",
		name: "In Warehouse",
		description: "Package is stored in warehouse",
	},
	IN_CONTAINER: {
		code: "IN_CONTAINER",
		name: "In Container",
		description: "Package is in container",
	},
	IN_PORT: {
		code: "IN_PORT",
		name: "In Port",
		description: "Package is in port wating for unloading",
	},

	// Customs States
	CUSTOMS_PENDING: {
		code: "CUSTOMS_PENDING",
		name: "Pending Customs",
		description: "Awaiting customs clearance",
	},

	CUSTOMS_CLEARED: {
		code: "CUSTOMS_CLEARED",
		name: "Customs Cleared",
		description: "Cleared customs, ready for delivery",
	},
	IN_TRANSIT: {
		code: "IN_TRANSIT",
		name: "In Transit",
		description: "Package is in transit to destination",
	},

	// Delivery States
	OUT_FOR_DELIVERY: {
		code: "OUT_FOR_DELIVERY",
		name: "Out for Delivery",
		description: "Package is out for delivery",
	},
	DELIVERY_ATTEMPTED: {
		code: "DELIVERY_ATTEMPTED",
		name: "Delivery Attempted",
		description: "Delivery was attempted but not completed",
	},
	DELIVERED: {
		code: "DELIVERED",
		name: "Delivered",
		description: "Package has been delivered successfully",
	},

	EXCEPTION: {
		code: "EXCEPTION",
		name: "Exception",
		description: "There is an issue with the shipment",
	},

	// Return States
	RETURN_TO_SENDER: {
		code: "RETURN_TO_SENDER",
		name: "Return to Sender",
		description: "Package is being returned to sender",
	},
	RETURNED: {
		code: "RETURNED",
		name: "Returned",
		description: "Package has been returned to sender",
	},

	// Container- Port specific States
} as const;
export const agenciesSeedData: Agency[] = [
	{
		id: 2,
		name: "Caribe Travel Express",
		contact: "Francisco Infanzon",
		phone: "3058513004",
		email: "gerencia@agencia.com",
		address: "10230 NW 80th Ave. Hialeah Gardens",
		parent: 0,
		isActive: true,
	},
];
/* export const agenciesSeedData: Agency[] = [
	{
		id: 2,
		name: "Caribe Travel Express",
		
		contact: "Francisco Infanzon",
		phone: "3058513004",
		email: "gerencia@agencia.com",
		address: "10230 NW 80th Ave. Hialeah Gardens",
		parent: 0,
		isActive: true,
	},
	{
		id: 120,
		name: "Continental Package Delivery",
		contact: "Ariel Lopez",
		phone: "3054563525",
		email: "travelamerica2015@yahoo.com",
		address: "8465 SW 40 ST FL 33155",
		parent: 0,
		isActive: true,
	},
	{
		id: 121,
		name: "Bello Caribe Travel",
		contact: "Katherine Padron",
		phone: "786 464 0647",
		email: "info@bellocaribetravel.com",
		address: "7358 SW 107 AVE FL 33173",
		parent: 0,
		isActive: true,
	},
	{
		id: 137,
		name: "Hegnaxin International",
		contact: "Juan Carlos",
		phone: "7865364659",
		email: "jciglesias@caribbeagtm.com",
		address: "",
		parent: 0,
		isActive: true,
	},
	{
		id: 138,
		name: "Suzetravelcorp",
		aliases: ["TRINIDASD"],
		contact: "Martha Suares Jose",
		phone: "3053399296",
		email: "mgs@turismosuze.com",
		address: "7339 SW 173 DR APTO 102   FL 33015",
		parent: 0,
		isActive: true,
	},
	{
		id: 128,
		name: "Brothersenvios",
		aliases: ["BTE"],
		contact: "Oscar",
		phone: "8137101910",
		email: "brothersenvios2020@gmail.com",
		address: "4117 w water ave  Tampa fl 33614",
		parent: 0,
		isActive: true,
	},
	{
		id: 129,
		name: "Cuba Encarga",
		aliases: ["CUL"],
		contact: "Duanel",
		phone: "838836846",
		email: "cubaencarga@gmail.com",
		address: "",
		parent: 0,
		isActive: true,
	},
	{
		id: 130,
		name: "Zakharov Auto Parts",
		aliases: ["ZAP"],
		contact: "Fabian",
		phone: "3054073590",
		email: "soporte@piezasladaparacuba.com",
		address: "",
		parent: 0,
		isActive: true,
	},
	{
		id: 177,
		name: "Para Cuba Travel",
		aliases: ["PCT"],
		contact: "Adel",
		phone: "7865865050",
		email: "viajes@paratravelcorp.com",
		address: "4401 SW 8 ST Miami FL",
		parent: 2,
		isActive: true,
	},
	{
		id: 132,
		name: "Wacha Travel",
		aliases: ["WDY"],
		contact: "Wendy",
		phone: "7864251992",
		email: "wendy.limasilveira@gmail.com",
		address: "4855 sw 93 ct Fl 33165",
		parent: 122,
		isActive: true,
	},
	{
		id: 133,
		name: "Santa Clara Travel",
		aliases: ["STCLARA"],
		contact: "Lisi",
		phone: "3052664285",
		email: "tomylisne@yahoo.com",
		address: "7339 WEST FLAGER  33144",
		parent: 2,
		isActive: true,
	},
	{
		id: 134,
		name: "A Cuba Envios",
		aliases: ["TEXAS"],
		contact: "Yadier Rivero",
		phone: "813-880-7929, 8138427756",
		email: "acubaenvios@gmail.com",
		address: "",
		parent: 2,
		isActive: true,
	},
	{
		id: 135,
		name: "Jade Travel",
		aliases: ["JOSEP"],
		contact: "Jose Pinero",
		phone: "9549010151",
		email: "jadetravelservices@gmail.com",
		address: "",
		parent: 0,
		isActive: true,
	},
	{
		id: 136,
		name: "La Cubana",
		aliases: ["NAPLE"],
		contact: "Ali Naple",
		phone: "2397844633",
		email: "aliannysmatos12@gmail.com",
		address: "5263 goldengate pkwy naples 34116",
		parent: 0,
		isActive: true,
	},
	{
		id: 139,
		name: "Houston International Investment",
		aliases: ["JORGEH"],
		contact: "Jorge Damian Estevez",
		phone: "8325810613",
		email: "info@acubavoy.com",
		address: "6302 BURNING TREE DR H TX",
		parent: 0,
		isActive: true,
	},
	{
		id: 140,
		name: "Yenya Envios Llc",
		aliases: ["YENYA"],
		contact: "Aymarys",
		phone: "8329698477",
		email: "yenyaenvios@yahoo.com",
		address: "27601 sw 134 ct",
		parent: 0,
		isActive: true,
	},
	{
		id: 141,
		name: "Cuba Envios Cape Coral",
		aliases: ["YAKIMIR"],
		contact: "Yakimir",
		phone: "2392587677",
		email: "yakimir@yahoo.es",
		address: "",
		parent: 0,
		isActive: true,
	},
	{
		id: 142,
		name: "Cuba Envios Lehigh",
		aliases: ["YAKIMIR 2"],
		contact: "Yakimir",
		phone: "2392587677",
		email: "castellonossain@gmail.com",
		address: "",
		parent: 0,
		isActive: true,
	},
	{
		id: 143,
		name: "Aeroenvio Global Group Inc",
		aliases: ["JUANC"],
		contact: "Juan Carlos",
		phone: "3056158659",
		email: "juan@aeroenvio.com",
		address: "HQ 10099 NW  89 AVE # 1 MEDLEY",
		parent: 2,
		isActive: true,
	},
	{
		id: 144,
		name: "Aeroenvio",
		aliases: ["AEROENVIO"],
		contact: "Juan Carlos Lopez",
		phone: "3053006956",
		email: "ivan@avsup.info",
		address: "10099 NW 89TH AVE UNIT 1",
		parent: 143,
		isActive: true,
	},
	{
		id: 145,
		name: "Miatravel",
		aliases: ["ALAIN"],
		contact: "Alain",
		phone: "7867829886",
		email: "mia.travelandcargo@yahoo.com",
		address: "324 W 21 ST HIALEAH",
		parent: 2,
		isActive: true,
	},
	{
		id: 146,
		name: "Latamfastshipping",
		aliases: ["JG KEN"],
		contact: "Jorge Rodriguez",
		phone: "9492002742",
		email: "dispatch@phleboservices.com",
		address: "3804 SHEPHERDSVILLE RD . LOUSVILLE , KY",
		parent: 2,
		isActive: true,
	},
	{
		id: 230,
		name: "Viva Cuba Orange Texas",
		aliases: ["BODEGA MI CUBANITA"],
		contact: "Daniela",
		phone: "3462551766",
		email: "agenciavivacubainc@gmail.com",
		address: "",
		parent: 229,
		isActive: true,
	},
	{
		id: 147,
		name: "RM International",
		aliases: ["JCO"],
		contact: "Juan Carlos Octavio",
		phone: "3053006956",
		email: "RMGROUP@AEROENVIO.COM",
		address: "8185 NW 7 TH ST",
		parent: 143,
		isActive: true,
	},
	{
		id: 149,
		name: "Daikiri Tours Inc",
		aliases: ["DTUR"],
		contact: "Antonio Marquez",
		phone: "3053995882",
		email: "info@daiquiriusa.com",
		address: "261 WESTWARD DRIVE ,SUITE 202 MIAMI SPRINGS",
		parent: 2,
		isActive: true,
	},
	{
		id: 150,
		name: "Capitalino",
		aliases: ["PADILLA"],
		contact: "Adolfo Padilla",
		phone: "7862196639",
		email: "apadilla18111962@gmail.com",
		address: "8145 NW  7 ST APTO 118",
		parent: 2,
		isActive: true,
	},
	{
		id: 151,
		name: "Bella Island Travel",
		aliases: ["YANI"],
		contact: "Yani",
		phone: "7868287147",
		email: "bellaislandtravel@yahoo.com",
		address: "18850 NW 7 th st",
		parent: 2,
		isActive: true,
	},
	{
		id: 152,
		name: "My Cuba Services",
		aliases: ["TOMAS"],
		contact: "Tomas Fonseca",
		phone: "7864097462",
		email: "tymcubaservices@yahoo.com",
		address: "9500 NW 79 AVE",
		parent: 2,
		isActive: true,
	},
	{
		id: 153,
		name: "DECM Multi Services Corp",
		aliases: ["ADY"],
		contact: "Ady",
		phone: "3055294221",
		email: "decmtravel1@gmail.com",
		address: "3434 SW 8 TH ST",
		parent: 2,
		isActive: true,
	},
	{
		id: 154,
		name: "MJ Miami Services LLC",
		aliases: ["MARTA"],
		contact: "Marta",
		phone: "7866606608",
		email: "mjmiamiamiservices@gmail.com",
		address: "8181 NW SOUTH RIVER DR #A-107 MADLEY",
		parent: 2,
		isActive: true,
	},
	{
		id: 155,
		name: "Farawaytravel Inc",
		aliases: ["JESUS"],
		contact: "Jesus Perez",
		phone: "7862865856",
		email: "faruny@yahoo.com",
		address: "10172SW 159 AV",
		parent: 0,
		isActive: true,
	},
	{
		id: 156,
		name: "Las Palmas Travel",
		aliases: ["PALMAS"],
		contact: "Rosabel Garrido",
		phone: "3059695620, 3052648823",
		email: "laspalmastravel@yahoo.com",
		address: "6903 WEST FLAGER ST",
		parent: 0,
		isActive: true,
	},
	{
		id: 157,
		name: "Las Palmas Travel 01",
		aliases: ["LIDIA"],
		contact: "Lidia Gomez",
		phone: "7869702541",
		email: "aidilmotor@yahoo.es",
		address: "6903 WEST FLAGER ST",
		parent: 0,
		isActive: true,
	},
	{
		id: 162,
		name: "Sol Tropical",
		aliases: ["FERNANDO"],
		contact: "Fernando Delgado",
		phone: "3053920579",
		email: "soltropical18@gmail.com",
		address: "1584 W 37 ST",
		parent: 2,
		isActive: true,
	},
	{
		id: 159,
		name: "Netcycle Trading Corp",
		aliases: ["NET"],
		contact: "Nadia Ledesma",
		phone: "3054708200",
		email: "carlos@netcyclecorp.com",
		address: "8020 NW 67 TH ST",
		parent: 2,
		isActive: true,
	},
	{
		id: 160,
		name: "MDL Travel",
		aliases: ["JAVIER"],
		contact: "Javier",
		phone: "3055131565",
		email: "mirtha.acosta@mdltravelservices.net",
		address: "1055 W 29 ST",
		parent: 2,
		isActive: true,
	},
	{
		id: 161,
		name: "Yumuri Travel",
		aliases: ["LEYDI"],
		contact: "Leydis Murgado",
		phone: "3056039699",
		email: "yumuritravel@yahoo.com",
		address: "6860 SW 13TH TER",
		parent: 2,
		isActive: true,
	},
	{
		id: 163,
		name: "Myli Travel",
		aliases: ["MYLI"],
		contact: "Juan Carlos",
		phone: "8138775340",
		email: "tigersontheroad@yahoo.com",
		address: "1761 W HILLSBOROUGH,TAMPA,FL",
		parent: 143,
		isActive: true,
	},
	{
		id: 164,
		name: "Aeroenvio",
		aliases: ["AEROENVIO"],
		contact: "Juan Carlos Lopez",
		phone: "3053006956",
		email: "ivan@avsup.info",
		address: "10099 NW 89TH AVE UNIT 1",
		parent: 143,
		isActive: true,
	},
	{
		id: 167,
		name: "Marfer Travel And Cargo",
		aliases: ["MARFER"],
		contact: "Marina C Reyes",
		phone: "7864577127",
		email: "Vuelosmarfer@gmail.com",
		address: "4766 GOLDEN GATE PKWAY UNIT 5",
		parent: 2,
		isActive: true,
	},
	{
		id: 166,
		name: "Star Blue",
		aliases: ["EB"],
		contact: "Gladis Reyes",
		phone: "3058032202",
		email: "starblueagencytravel@gmail.com",
		address: "18901 SW 107 AVE UNIT 104",
		parent: 2,
		isActive: true,
	},
	{
		id: 168,
		name: "Envios Roman",
		aliases: ["MAGDA"],
		contact: "Osniel",
		phone: "3059607310",
		email: "romanenvios@gmail.com",
		address: "5580 W 16 TH HIALEAH SUT 101",
		parent: 2,
		isActive: true,
	},
	{
		id: 170,
		name: "Taino Of Tampa",
		aliases: ["TOT"],
		contact: "Juan Carlos",
		phone: "8138767080, 8134746988",
		email: "cubasitravel@gmail.com",
		address: "3241 W Columbus Drive Tampa FL 33607",
		parent: 2,
		isActive: true,
	},
	{
		id: 171,
		name: "Cuba y Mas Multiservices",
		aliases: ["CYM"],
		contact: "William Milian",
		phone: "8133053215, 8137755487",
		email: "cubaymasmultiservices@gmail.com",
		address: "3055 W Hillsborough Ave Tampa FL 33614",
		parent: 2,
		isActive: true,
	},
	{
		id: 172,
		name: "CostAzul",
		aliases: ["CAZ"],
		contact: "Yoel",
		phone: "813-880-7929, 8138427756",
		email: "costazultravel1@hotmail.com",
		address: "8228 W Waters Ave Tampa FL 33615",
		parent: 2,
		isActive: true,
	},
	{
		id: 173,
		name: "Rapid Multiservice",
		aliases: ["RAP"],
		contact: "Ramoncito",
		phone: "3055152551, 7867815991",
		email: "rlopez@rapidmultiservices.com",
		address: "4026 W 12th Ave, Miami FL 33012",
		parent: 2,
		isActive: true,
	},
	{
		id: 174,
		name: "Aylin",
		aliases: ["AylYn"],
		contact: "Aylyn",
		phone: "2819140907",
		email: "yadier7628@gmail.com",
		address: "18703 W li ct",
		parent: 134,
		isActive: true,
	},
	{
		id: 175,
		name: "OML Caribe Cargo Corp",
		aliases: ["OML"],
		contact: "Orlendys Mantilla",
		phone: "7866600545",
		email: "caribecargo@yahoo.com",
		address: "2450 W 82 nd St Suite 211 Hialeah Fl 33016",
		parent: 2,
		isActive: true,
	},
	{
		id: 176,
		name: "PST Express",
		aliases: ["PST"],
		contact: "Gilberto Roque /Yulima",
		phone: "3055884105",
		email: "groque825@gmail.com",
		address: "8186 NW 103 calle Hialeah Gardens 33016",
		parent: 2,
		isActive: true,
	},
	{
		id: 178,
		name: "MOF Group",
		aliases: ["CUBATEL"],
		contact: "Maykel Graveran",
		phone: "3053022417",
		email: "MAYKELG@CUBATEL.COM",
		address: "734 W  49 ST HIALEAH  33012",
		parent: 2,
		isActive: true,
	},
	{
		id: 179,
		name: "Paraiso Latino",
		aliases: ["PL"],
		contact: "Carlos Blanco",
		phone: "7867092013",
		email: "ingblancoc@yahoo.com",
		address: "4441 s easter  ave",
		parent: 2,
		isActive: true,
	},
	{
		id: 181,
		name: "Dimedistribution",
		aliases: ["DIMECENT"],
		contact: "Javier Medina",
		phone: "7862632772",
		email: "javier.medina@dimecuba.com",
		address: "8644 Palm Ave",
		parent: 2,
		isActive: true,
	},
	{
		id: 182,
		name: "Gaviota Express",
		aliases: ["GAVIOTA"],
		contact: "Yurisleidy",
		phone: "7862055540    2396013769",
		email: "gaviotaexpress@yahoo.com",
		address: "12801 sw 148 terrace  33186",
		parent: 2,
		isActive: true,
	},
	{
		id: 183,
		name: "Gallo Travel Agency",
		aliases: ["GALLO"],
		contact: "Tatiana",
		phone: "7867622630",
		email: "INFOGALLOTRAVEL@AOL.COM",
		address: "7214  SW  8 ST MIAMI FL 33144",
		parent: 2,
		isActive: true,
	},
	{
		id: 184,
		name: "Palm Suit Travels",
		aliases: ["Amael"],
		contact: "Jose Amael Rubio",
		phone: "2395806624",
		email: "amael.rubio@outlook.com",
		address: "La Principal 5580 19th Ct SW, Naples, Florida,34116",
		parent: 2,
		isActive: true,
	},
	{
		id: 185,
		name: "Elegance Travel LLC",
		aliases: ["ELE"],
		contact: "Jorge Aguilar",
		phone: "7862306244",
		email: "elegancetravel89@gmail.com",
		address: "360 E 11th St Hialeah Fl 33010",
		parent: 2,
		isActive: true,
	},
	{
		id: 186,
		name: "Los Pinos Multiple Services Inc",
		aliases: ["PMS"],
		contact: "Pilar Gomez",
		phone: "7863620756",
		email: "lospinostravel@gmail.com",
		address: "6863 W 4 Avenue Hialeah",
		parent: 2,
		isActive: true,
	},
	{
		id: 187,
		name: "Popes Travel",
		aliases: ["PT"],
		contact: "Adriel Duarte",
		phone: "7867550946",
		email: "popestravelllc@gmail.com",
		address: "7345 SW 8th  St Miami",
		parent: 2,
		isActive: true,
	},
	{
		id: 188,
		name: "Dimelos Travel",
		aliases: ["DT"],
		contact: "Arian Alvarez",
		phone: "7867095811",
		email: "arian@dimelos.com",
		address: "7441 NW 72nd Ave Miami",
		parent: 2,
		isActive: true,
	},
	{
		id: 189,
		name: "TY Multiservices Inc",
		aliases: ["TY"],
		contact: "Claudia Ramirez",
		phone: "7322777415",
		email: "tymultiservicesinc@gmail.com",
		address: "1749 N MILITARY TRL SUITE 2 WPB",
		parent: 2,
		isActive: true,
	},
	{
		id: 190,
		name: "Kuban Tour Travel",
		aliases: ["KUB"],
		contact: "Orly Socarras",
		phone: "7862889607",
		email: "reyescombotransport@gmail.com",
		address: "8521 NW Souht River Drive Medly",
		parent: 2,
		isActive: true,
	},
	{
		id: 191,
		name: "FDF Logistics LLC",
		aliases: ["FLL"],
		contact: "Diocles",
		phone: "7862523539",
		email: "info@zonenvio.com",
		address: "10228 NW 80TH AVE\n HIALEAH GDNS, FL 33016",
		parent: 2,
		isActive: true,
	},
	{
		id: 192,
		name: "Excelent Solutions",
		aliases: ["EXC"],
		contact: "Nestor Hernandez",
		phone: "3052058052",
		email: "nestoryadiel31@gmail.com",
		address: "6267 w 24 ave Hialeah Gardens FL 33016",
		parent: 2,
		isActive: true,
	},
	{
		id: 193,
		name: "Havapack Express LLC",
		aliases: ["HAVA"],
		contact: "Rafael Lopez",
		phone: "7869855215",
		email: "toimilgrisell@gmail.com",
		address: "7064 W 29 Avenida Hialeah FL 33018",
		parent: 2,
		isActive: true,
	},
	{
		id: 194,
		name: "District Cuba Miami",
		aliases: ["DIST"],
		contact: "Orlando Palacio",
		phone: "7866426980",
		email: "orlando@districtcuba.com",
		address: "7500 Bellaire Blvd Suite M120",
		parent: 2,
		isActive: true,
	},
	{
		id: 195,
		name: "Havana Travel Orlando",
		aliases: ["HAV"],
		contact: "Barbara Garcia",
		phone: "7863166754",
		email: "barbara@havanaservicesgroup.con",
		address: "2106 E Osceola Pkwy Kissimmee 34743",
		parent: 2,
		isActive: true,
	},
	{
		id: 196,
		name: "District Cuba Houston",
		aliases: ["DIST h"],
		contact: "Ileana Arias",
		phone: "8329750886",
		email: "ilena@districtcuba.com",
		address: "7500 Bellaire Blv",
		parent: 194,
		isActive: true,
	},
	{
		id: 197,
		name: "District Cuba Dallas",
		aliases: ["DIST N"],
		contact: "Nelvis Valdaliso",
		phone: "6892498916",
		email: "nelvis@districtcuba.com",
		address: "555 W Airopt  Fwy Suit 140 Irvinh Texas",
		parent: 194,
		isActive: true,
	},
	{
		id: 198,
		name: "Villarejo 1 Travel",
		aliases: ["VILL 1"],
		contact: "Carlos Villarejo",
		phone: "7863328461",
		email: "CARLOS.VILLAREJO1218@GMAIL.COM",
		address: "11200 W FLAGLER ST",
		parent: 2,
		isActive: true,
	},
	{
		id: 199,
		name: "Dimedistribution Hialeah",
		aliases: ["DIMEHIAL"],
		contact: "Sandra Hernandez",
		phone: "7867027999",
		email: "sandrahernandez@dimecuba.com",
		address: "3750 w 16th Ave Hialeah Fl 33012",
		parent: 181,
		isActive: true,
	},
	{
		id: 200,
		name: "Dimedistribution Tampa",
		aliases: ["DIMETAMP"],
		contact: "Aida Rosa Oye",
		phone: "3057413275",
		email: "aida.rosa@dimecuba.com",
		address: "4040 W Waters Ave #103",
		parent: 181,
		isActive: true,
	},
	{
		id: 201,
		name: "Dimedistribution YUC Online",
		aliases: ["DIMEYUC"],
		contact: "Yenny Padron",
		phone: "529995163701",
		email: "yenny.pa@dimecuba.com",
		address: "8644 Palm Ave",
		parent: 181,
		isActive: true,
	},
	{
		id: 202,
		name: "La Principal 2",
		aliases: ["LAPRINC2"],
		contact: "Amael Rubio",
		phone: "239 821 1082",
		email: "amael_xio@yahoo.es",
		address: "9301 SW 92th AVe, Miam",
		parent: 2,
		isActive: true,
	},
	{
		id: 203,
		name: "La Cubana Multiservices",
		aliases: ["LACUBANA"],
		contact: "Aliannys Matos",
		phone: "2397844633",
		email: "alliannysmatos12@gmail.com",
		address: "5263 golden gate Pw , Naples",
		parent: 2,
		isActive: true,
	},
	{
		id: 204,
		name: "Houston Havana Travel",
		aliases: ["HAVT"],
		contact: "Leonardo Lavin",
		phone: "7865691861",
		email: "leolavin25@icloud.com",
		address: "16211 Clay Rd Houston",
		parent: 2,
		isActive: true,
	},
	{
		id: 205,
		name: "Vacuba",
		aliases: ["VAC"],
		contact: "Heder",
		phone: "7865992448",
		email: "heder.martinez@vacuba.com",
		address: "2994 NW 7th St Miami",
		parent: 2,
		isActive: true,
	},
	{
		id: 206,
		name: "Chumrite",
		aliases: ["CHUM"],
		contact: "Luis Fernadez (Pocho)",
		phone: "3057106202",
		email: "chumritelf@yahoo.com",
		address: "15800 SW 90 Ave Palm Bay Miami",
		parent: 2,
		isActive: true,
	},
	{
		id: 207,
		name: "Sky Blue Cargo",
		aliases: ["SKYBLUE"],
		contact: "Maidelys Alvarez",
		phone: "3053336563",
		email: "skybluecargo@gmail.com",
		address: "10230 NW 80th Ave, Hialeah Gardens 33016",
		parent: 2,
		isActive: true,
	},
	{
		id: 208,
		name: "Rapid Via Services",
		aliases: ["RVIA"],
		contact: "Orlen Escalona",
		phone: "9415367542",
		email: "rapidviaservices@gmail.com",
		address: "3220 17th Street Sarasota",
		parent: 2,
		isActive: true,
	},
	{
		id: 209,
		name: "Morgade Cabrera",
		aliases: ["MORGA"],
		contact: "German",
		phone: "3057562348",
		email: "german69051611@gmail.com",
		address: "10230 nw 80th ave hialeah",
		parent: 2,
		isActive: true,
	},
	{
		id: 210,
		name: "Palmera Express",
		aliases: ["PALM"],
		contact: "Sindy Chirino",
		phone: "7867863137",
		email: "palmeraenvios@gmail.com",
		address: "20812 S DIXIE HWY MIAMI",
		parent: 2,
		isActive: true,
	},
	{
		id: 211,
		name: "Cubana Services",
		aliases: ["CUBASERV"],
		contact: "Jackeline Leal",
		phone: "9542430992",
		email: "cubanaservices@gmail.com",
		address: "5948 THOMAS ST HOLLIWOOD",
		parent: 2,
		isActive: true,
	},
	{
		id: 212,
		name: "Telegiro",
		aliases: ["TELE"],
		contact: "Goar Gonzalez",
		phone: "7867798899",
		email: "goar@telegiro.com",
		address: "5201 BLUEE LAGOON DR",
		parent: 2,
		isActive: true,
	},
	{
		id: 213,
		name: "Playa Azul",
		aliases: ["PLAYA"],
		contact: "Raoul Cabrera",
		phone: "7864879815",
		email: "playazulh@gmail.com",
		address: "6620 W FLAGLER ST  MIAMI",
		parent: 2,
		isActive: true,
	},
	{
		id: 214,
		name: "KSI Free Multiservices",
		aliases: ["KSI"],
		contact: "Liz Martinez",
		phone: "7869211364",
		email: "fuegoypoder@gmail.com",
		address: "815 NW 5TH AVE NO. 203",
		parent: 2,
		isActive: true,
	},
	{
		id: 215,
		name: "Zas Envios",
		aliases: ["ZAS"],
		contact: "German",
		phone: "3057532348",
		email: "german69051611@yahoo.com",
		address: "10230 nw 80 th ave hialeah gardens",
		parent: 2,
		isActive: true,
	},
	{
		id: 217,
		name: "Tony Leigh High",
		aliases: ["Tony"],
		contact: "Tony",
		phone: "2392194505",
		email: "megarevolution2@yahoo.com",
		address: "",
		parent: 215,
		isActive: true,
	},
	{
		id: 218,
		name: "Yadir Leigh High",
		aliases: ["YLEIGH"],
		contact: "Yadir",
		phone: "2394691956",
		email: "yadirdeltoro@gmail.com",
		address: "",
		parent: 215,
		isActive: true,
	},
	{
		id: 219,
		name: "Riagusa",
		aliases: ["Riagusa"],
		contact: "Richard Aguero",
		phone: "7865188377",
		email: "contact@riagusa.com",
		address: "13820 Madison St",
		parent: 215,
		isActive: true,
	},
	{
		id: 220,
		name: "Nayeli Cape Coral",
		aliases: ["NAYCAPE"],
		contact: "Nayeli",
		phone: "7868523141",
		email: "a24globalnb@gmail.com",
		address: "1912 NE 5ta Ave. 33909",
		parent: 215,
		isActive: true,
	},
	{
		id: 221,
		name: "Bien Barato SuperMarket",
		aliases: ["BARATO"],
		contact: "Ivan",
		phone: "3056320130",
		email: "bienbarartosupermarket@gmail.com",
		address: "5788 W Flager St. 33144",
		parent: 215,
		isActive: true,
	},
	{
		id: 222,
		name: "Gonna Go Travel",
		aliases: ["GONNA"],
		contact: "Gretel Creme",
		phone: "239 265 7294",
		email: "gretel@gonnagotravel.com",
		address: "4316 Lee Boulevar Unit 5 Lehigh Acres",
		parent: 2,
		isActive: true,
	},
	{
		id: 223,
		name: "Casablanca Multiservices",
		aliases: ["CASABLAN"],
		contact: "Wendy Martinez",
		phone: "7869300457",
		email: "casablancamultiservicesllc@gmail.com",
		address: "10550 NW 77ct Suite 205 Hialeah Gardens",
		parent: 2,
		isActive: true,
	},
	{
		id: 224,
		name: "My Paradays Travel",
		aliases: ["MAYPARA"],
		contact: "Jordayns",
		phone: "7863709242",
		email: "myparadaystravel@gmail.com",
		address: "",
		parent: 215,
		isActive: true,
	},
	{
		id: 225,
		name: "Cuba Envios Port Charlotte",
		aliases: ["PORTCHA"],
		contact: "Yakimir Rosales",
		phone: "9418839988",
		email: "cubaenviosportcharlotte@gmail.com",
		address: "3265 s tamiami trail unidad c",
		parent: 2,
		isActive: true,
	},
	{
		id: 226,
		name: "Aguila International Services",
		aliases: ["AGUILA"],
		contact: "Robert Aguila",
		phone: "7867841410",
		email: "aguilarob86@gmail.com",
		address: "4805 NW 79 AVE SUITE 12 Doral",
		parent: 2,
		isActive: true,
	},
	{
		id: 227,
		name: "Kubacargo",
		aliases: ["KUBA"],
		contact: "Grecia Carmona Blanco",
		phone: "7864886142",
		email: "kubacargoexpress@gmail.com",
		address: "1630 w 79 st",
		parent: 2,
		isActive: true,
	},
	{
		id: 228,
		name: "Villarejo 3 Travel",
		aliases: ["VILL 3"],
		contact: "Antonio Daquinta Gradaille",
		phone: "7867264328",
		email: "villarejotravel3@gmail.com",
		address: "5850 NW 183 ST  MIAMI",
		parent: 2,
		isActive: true,
	},
	{
		id: 229,
		name: "Viva Cuba",
		aliases: ["VICUBA"],
		contact: "Juan Gonzalez",
		phone: "832 689 6414",
		email: "vivacubainc@gmail.com",
		address: "8282 BELLAIRE BLVD.\nSUITE # 136 HOUSTON",
		parent: 2,
		isActive: true,
	},
] as const; */
export const statusSeedData: Status[] = [
	{
		id: 1,
		code: "CREATED",
		name: "Created",
		description: "Shipment has been registered in the system",
	},
	{
		id: 2,
		code: "IN_WAREHOUSE",
		name: "In Warehouse",
		description: "Package is stored in warehouse",
	},
	{
		id: 3,
		code: "IN_CONTAINER",
		name: "In Container",
		description: "Package is in container",
	},
	{
		id: 4,
		code: "IN_PORT",
		name: "In Port",
		description: "Package is in port wating for download",
	},
	{
		id: 5,
		code: "CUSTOMS_PENDING",
		name: "Pending Customs",
		description: "Awaiting customs clearance",
	},
	{
		id: 6,
		code: "READY_FOR_PICKUP",
		name: "Ready for Pickup",
		description: "Package has been cleared by customs and is ready for pickup",
	},

	{
		id: 7,
		code: "IN_TRANSIT",
		name: "In Transit",
		description: "Package is in transit to destination",
	},

	{
		id: 8,
		code: "MESSENGER_RECEIVED",
		name: "Messenger Received",
		description: "Package has been received by the messenger",
	},
	{
		id: 9,
		code: "OUT_FOR_DELIVERY",
		name: "Out for Delivery",
		description: "Package is out for delivery",
	},

	{
		id: 10,
		code: "DELIVERED",
		name: "Delivered",
		description: "Package has been delivered to the recipient",
	},

	{
		id: 11,
		code: "EXCEPTION",
		name: "Exception",
		description: "There is an issue with the shipment",
	},
];
/* export const statusSeedData = Object.values(SHIPMENT_STATUSES).map((status, index) => ({
	id: index + 1,
	code: status.code,
	name: status.name,
	description: status.description,
})); */
