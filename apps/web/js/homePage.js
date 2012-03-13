$(document).ready(function () {
    // =======================================
    // SEARCH FILTER
    // =======================================
        $("#ageRange").slider({
            range: true,
            min: 18,
            max: 99,
            values: [26, 91],
            slide: function (event, ui) {
                $("#ageNum").val(ui.values[0] + " - " + ui.values[1] + " years old");

                // small easter egg :)
                if (ui.values[1] == 99) {
                    $("#ageNum").val(ui.values[0] + " - " + ui.values[1] + " years old (wow!)");
                }
            }
        });
        $("#ageNum").val($("#ageRange").slider("values", 0) + " - " + $("#ageRange").slider("values", 1) + " years old");

        $('#doSearch').click(function () {
            IS.navigateTo('#search', 'Search results');
        });

        $('#buttonAddLikes').click(function () {
            IS.navigateTo('#beta', 'Almost there!');
        });
});