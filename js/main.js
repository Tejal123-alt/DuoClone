$(document).ready(function () {

    // Get Started Button -> Choose Language to Learn
    $("#startBtn, #bottomStartBtn").click(function () {
        window.location.href = "signup.html";
    });

    // Login Button
    $("#loginBtn").click(function () {
        window.location.href = "login.html";
    });

    // Language Card click -> Select Native Language next
    $(".language-card").click(function () {
        let selectedLang = $(this).find(".card-lang-name").text().trim();
        localStorage.setItem("userLanguage", selectedLang);
        window.location.href = "select-native-language.html";
    });

    // Language Dropdown
    $("#lang-selector-btn").click(function (e) {
        e.stopPropagation();

        $("#flag-dropdown-menu").slideToggle(200);

        let expanded =
            $(this).attr("aria-expanded") === "true";

        $(this).attr("aria-expanded", !expanded);
    });

    // Close dropdown when clicking outside
    $(document).click(function () {
        $("#flag-dropdown-menu").slideUp(200);

        $("#lang-selector-btn")
            .attr("aria-expanded", "false");
    });

    // Prevent menu close when clicking inside
    $("#flag-dropdown-menu").click(function (e) {
        e.stopPropagation();
    });

    // Change selected language
    $(".flag-grid-item").click(function (e) {

        e.preventDefault();

        $(".flag-grid-item")
            .removeClass("active");

        $(this)
            .addClass("active");

        let selectedLanguage =
            $(this).data("lang");

        $(".selected-lang-text")
            .text("Site Language: " + selectedLanguage);

        $("#flag-dropdown-menu")
            .slideUp(200);

        $("#lang-selector-btn")
            .attr("aria-expanded", "false");
    });

    // Navbar shadow on scroll
    $(window).scroll(function () {

        if ($(window).scrollTop() > 50) {
            $("#main-nav")
                .addClass("navbar-scrolled");
        } else {
            $("#main-nav")
                .removeClass("navbar-scrolled");
        }

    });

});