"use strict";
exports.__esModule = true;
var rawJsonData = require("./donors.json");
function getDonors() {
    return doMotherFuckerSort(rawJsonData);
}
exports.getDonors = getDonors;
function getTotalAmountAsString() {
    var result = 0.0;
    rawJsonData.forEach(function (d) {
        result += parseFloat(d.amount);
    });
    return result.toFixed(2);
}
exports.getTotalAmountAsString = getTotalAmountAsString;
function getTotalTimes() {
    return rawJsonData.length;
}
exports.getTotalTimes = getTotalTimes;
function doMotherFuckerSort(data) {
    var result = rawJsonData.sort(normalsort);
    result = result.sort(sortByPriority);
    return result;
}
function sortByPriority(a, b) {
    if (a.priority == undefined) {
        a.priority = 0;
    }
    if (b.priority == undefined) {
        b.priority = 0;
    }
    return b.priority - a.priority;
}
function normalsort(a, b) {
    if (a.amount === b.amount) {
        return isEarlyThan(a, b);
    }
    else {
        return b.amount - a.amount;
    }
}
function isEarlyThan(a, b) {
    var __d = new Date();
    var c0 = a.date.split('/');
    var c1 = b.date.split('/');
    var d0 = __d.setFullYear(c0[2], c0[0], c0[1]);
    var d1 = __d.setFullYear(c1[2], c1[0], c1[1]);
    return d1 - d0;
}
