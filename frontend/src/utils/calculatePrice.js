export const calculatePrice = (basePrice, pricingRules = []) => {
    let price = basePrice;

    pricingRules.forEach(rule => {
        if (rule.op === "add") {
            price += rule.value;
        } else if (rule.op === "mul") {
            price *= rule.value;
        }
    });

    return Math.max(0, Math.round(price));
}