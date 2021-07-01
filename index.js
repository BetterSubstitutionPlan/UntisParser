var timetable = require("./timetable");
var substitutionplan = require("./substitutionplan");

module.exports = {
    parseTimetable: timetable.parse,
    parseSubstitutionplan: substitutionplan.parse
}