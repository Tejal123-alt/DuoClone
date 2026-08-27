$(document).ready(function(){

    let progress = 0;
    const tips = [
        "Analyzing your experience level...",
        "Loading course units and grammar blocks...",
        "Polishing Duo the Owl's green feathers...",
        "Generating listening drills and phonetics...",
        "Setting up your starting Gems wallet...",
        "Arranging the Bronze League tables...",
        "Final checks... Get ready to learn!"
    ];

    let interval = setInterval(function(){
        progress += 2; // Slower, smoother loading increment

        $("#progressBar").css("width", progress + "%");
        $("#percentText").text(progress + "%");

        // Cycle tips based on progress thresholds
        let tipIndex = Math.floor(progress / 15);
        if (tipIndex < tips.length) {
            $("#loadingTip").text(tips[tipIndex]);
        }

        if(progress >= 100){
            clearInterval(interval);
            // After loading, redirect to learn.html in the root folder
            window.location.href = "../learn.html";
        }
    }, 60);

});