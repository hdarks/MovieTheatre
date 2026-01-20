export const formatDate = (date, withTime = true) => {
    if (!date) return "";

    const d = new Date(date);
    const options = {
        year: "numberic",
        month: "short",
        day: "numberic"
    };

    if (withTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
    }
    return d.toLocaleString("en-IN", options);
}