// utils/validators.js

function isNonEmptyString(str) {
    return typeof str === 'string' && str.trim().length > 0;
}

function looksLikeEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Allowed plans
const VALID_PLANS = ['Trial', 'Monthly', 'Quarterly', 'Yearly'];

function isValidPaymentPlan(plan) {
    return VALID_PLANS.includes(plan);
}

module.exports = { isNonEmptyString, looksLikeEmail, isValidPaymentPlan };
