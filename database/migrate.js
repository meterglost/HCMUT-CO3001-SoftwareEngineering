db.createCollection("printer");

db.printer.insertMany([
	{
		name: "Printer 1",
		location: "101H6",
		requestId: [],
	},
	{
		name: "Printer 2",
		location: "201H6",
		requestId: [],
	},
	{
		name: "Printer 3",
		location: "301H6",
		requestId: [],
	},
	{
		name: "Printer 4",
		location: "401H6",
		requestId: [],
	},
]);

db.createCollection("request");
