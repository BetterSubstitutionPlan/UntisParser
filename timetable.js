const cheerio = require('cheerio');

function parse(html) {
    // Load the html
    var $ = cheerio.load(html);

    // Get the main table
    var maintable = $('body > center > table:nth-child(5)')

    // replace colspan and rowspan into real columns
    tr = $(maintable).find("td[colspan]");
    tr.each((index, elem) => {
        rowspan = $(elem).attr("colspan");
        $(elem).attr("colspan", rowspan / 12);
    })

    // from https://stackoverflow.com/questions/14613762/split-rowspan-cells-in-multiple-cells-using-jquery (https://stackoverflow.com/a/65549731) & http://jsfiddle.net/tcvax28d/38/
    function split_rows(tbl_param) {
        var tbl = $(tbl_param);
        var tempTable = tbl.clone(true);
        var tableBody = $(tempTable).children();
        $(tableBody).children().each(function (index, item) {
            var currentRow = item;
            $(currentRow).children().each(function (index1, item1) {
                var rows = $(item1).attr("rowspan");
                if (rows >= 2) {
                    // copy the cell
                    var item2 = $(item1).clone(true);
                    // Remove rowspan
                    $(item1).removeAttr("rowspan");
                    $(item2).attr("rowspan", (rows) - 1);
                    // console.log("item1:", $(item1).text(), ", index:", index1);
                    // last item's index in next row
                    var indexOfLastElement = $(currentRow).next().children().last().index();
                    if (indexOfLastElement < index1) {
                        $(currentRow).next().append(item2)
                    } else {
                        // intermediate cell insertion
                        $(item2).insertBefore($(currentRow).next().children().eq(index1));
                    }
                }
            });

        });
        return tempTable;
    }

    function split_cols(tbl_param) {
        var tbl = $(tbl_param);
        var tempTable = tbl.clone(true);
        var tableBody = $(tempTable).children();
        $(tableBody).children().each(function (index, item) {
            var currentRow = item;
            for (var i = 0; i < $(currentRow).children().length; i++) {
                var item1 = $(currentRow).children().eq(i);
                var cols = $(item1).attr("colspan");
                if (cols >= 2) {
                    // copy the cell
                    var item2 = $(item1).clone(true);

                    // Remove rowspan
                    $(item1).removeAttr("colspan");
                    $(item2).attr("colspan", cols - 1);
                    // last item's index in next row
                    $(item2).insertAfter(item1);
                }

            }

        });
        return tempTable;
    }

    function split_tbl(tbl_param) {
        var tbl = split_cols(tbl_param);
        tbl = split_rows(tbl);
        return tbl;
    }

    splitted = split_tbl($(maintable))
    $("body").find("table").remove()
    $("body").append(splitted)

    // parse the table
    tr = $("body").find("table[border] > tbody > tr");

    var weeks = [];
    var days = []
    var events = {};

    tr.each((rowcount, trelement) => {
        td = $(trelement).find('td > table')
        td.each((columncnt, element) => {
            elem = $(element)
            text = elem.text();
            cleantext = text.replace(/\n/g, "").replace(/ $/, "")

            if (rowcount == 0) {
                // do nothing
            } else if (rowcount == 1) {
                weeks[columncnt] = cleantext;
            } else {
                if (columncnt == 0) {
                    // console.error(columncnt+": "+cleantext)
                    days[rowcount] = cleantext; // used rowcount/2 because there is an empty tr after every real tr
                } else {
                    if (typeof events[weeks[columncnt]] == "undefined") events[weeks[columncnt]] = {}
                    if (!days[rowcount].includes(".")) {
                        events[weeks[columncnt]][days[rowcount]] = cleantext
                    }
                }
            }
        })
    })

    return events;
}

module.exports = {
    parse: parse
};