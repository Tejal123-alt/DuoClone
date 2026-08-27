$(document).ready(function() {

    // 1. Load data from LocalStorage
    let userName = localStorage.getItem("userName") || "Learner";
    let userEmail = localStorage.getItem("userEmail") || "learner@duolingo.com";
    let userStreak = parseInt(localStorage.getItem("userStreak") || "0");
    let userXP = parseInt(localStorage.getItem("userXP") || "0");
    let userGems = parseInt(localStorage.getItem("userGems") || "100");
    let userHearts = parseInt(localStorage.getItem("userHearts") || "5");
    let userAvatar = localStorage.getItem("userAvatar") || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    // Set textual properties in DOM
    $("#profileName").text(userName);
    $("#profileEmail").text(userEmail);
    $("#profileStreak, #streakCount").text(userStreak);
    $("#profileXP, #xpCount").text(userXP);
    $("#profileGems, #gemsCount").text(userGems);
    $("#heartsCount").text(userHearts);
    $("#userProfileImg").attr("src", userAvatar);

    // 2. Achievements Progress Computations
    // Achievement A: Streak Society (7 Days)
    let streakPct = Math.min(100, Math.round((userStreak / 7) * 100));
    $("#streakProgressBar").css("width", streakPct + "%");
    $("#streakProgressText").text(`${userStreak} / 7 Days`);

    // Achievement B: Gems Collector (300 Gems)
    let gemsPct = Math.min(100, Math.round((userGems / 300) * 100));
    $("#gemsProgressBar").css("width", gemsPct + "%");
    $("#gemsProgressText").text(`${userGems} / 300 Gems`);

    // Achievement C: XP Master (500 XP)
    let xpPct = Math.min(100, Math.round((userXP / 500) * 100));
    $("#xpProgressBar").css("width", xpPct + "%");
    $("#xpProgressText").text(`${userXP} / 500 XP`);

    // 3. Interactive Avatar Customizer Dialog
    let tempSelectedAvatar = userAvatar;

    $("#changeAvatarTrigger").click(function() {
        // Highlight current active avatar in the modal selector
        $(".avatar-option").removeClass("selected");
        $(`.avatar-option[data-img="${userAvatar}"]`).addClass("selected");
        
        $("#avatarModalOverlay").fadeIn(200);
    });

    $(".avatar-option").click(function() {
        $(".avatar-option").removeClass("selected");
        $(this).addClass("selected");
        tempSelectedAvatar = $(this).data("img");
    });

    $("#avatarCancelBtn").click(function() {
        $("#avatarModalOverlay").fadeOut(150);
    });

    $("#avatarSaveBtn").click(function() {
        userAvatar = tempSelectedAvatar;
        localStorage.setItem("userAvatar", userAvatar);
        $("#userProfileImg").attr("src", userAvatar);
        
        $("#avatarModalOverlay").fadeOut(150);
        showDuoModal({
            title: "Avatar Saved!",
            message: "Your new profile avatar mascot has been updated successfully.",
            type: "success",
            buttonText: "COOL"
        });
    });

    // 4. Logout triggers
// Logout handled by common logout.js

});