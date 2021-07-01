const timetable = require("./timetable");
const substitutionplan = require("./substitutionplan");

module.exports = {
    parseTimetable: timetable.parse,
    parseSubstitutionplan: substitutionplan.parse
}