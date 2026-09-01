// utils/validators.js
// Common validation helpers

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function looksLikeEmail(value) {
    return typeof value === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPlan(value) {
    const plans = ['Monthly', 'Quarterly', 'Yearly'];
    return typeof value === 'string' && plans.includes(value.trim());
}

module.exports = {
    isNonEmptyString,
    looksLikeEmail,
    isValidPlan,
};
