export const statusClasses = {
	PROCESSED: {
		primary: "bg-inherit",
		secondary: "border-inherit",
	},
	PROCESSING: {
		primary: "bg-gray-100 animate-pulse",
		secondary: "border-gray-100",
	},
	FAILED: {
		primary: "bg-red-100 border-red-500",
		secondary: "border-red-500",
	},
};

export const statusMessages = {
	PROCESSING: { text: "Processing...", className: "text-muted-foreground" },
	FAILED: { text: "Failed to process template", className: "text-red-500" },
};
