export const calculatePrice = (basePrice, pricingRules = []) => {
    let price = Number(basePrice);
    if (isNaN(price)) return 0;

    pricingRules.forEach(rule => {
        const value = Number(rule.value);
        if (isNaN(value)) return;
        if (rule.op === "add") {
            price += value;
        } else if (rule.op === "mul") {
            price *= value;
        }
    });

    return Math.max(0, Math.round(price));
}