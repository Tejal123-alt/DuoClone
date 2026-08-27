
// $(document).ready(function(){

//     $("#signupBtn").click(function(){

//         window.location.href = "onboarding/signup.html";

//     });

// });


$(document).ready(function(){

    $("#loginForm").submit(function(e){
        e.preventDefault();

        // Hide validation messages initially
        $(".invalid-feedback").hide();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        // Live validation for username (email) and password
        // Live validation for username (email)
        $("#username").on("input", function() {
            const val = $(this).val().trim();
            if (!emailPattern.test(val)) {
                $(this).addClass("is-invalid");
                $("#loginEmailFeedback").show();
            } else {
                $(this).removeClass("is-invalid");
                $("#loginEmailFeedback").hide();
            }
        });
        
        let enteredEmail = $("#username").val().trim();
        let savedEmail = localStorage.getItem("userEmail");
        let savedUsername = localStorage.getItem("userName");

        // Allow logging in with either email or username (ignoring password)
        if (enteredEmail === savedEmail || enteredEmail === savedUsername) {
            
            // Make sure gaming variables exist
            if (!localStorage.getItem("userStreak")) localStorage.setItem("userStreak", "0");
            if (!localStorage.getItem("userXP")) localStorage.setItem("userXP", "0");
            if (!localStorage.getItem("userGems")) localStorage.setItem("userGems", "100");
            if (!localStorage.getItem("userHearts")) localStorage.setItem("userHearts", "5");

            showDuoModal({
                title: "Welcome Back!",
                message: `Great to see you again, ${savedUsername || 'Learner'}! Let's continue your streak!`,
                type: "success",
                buttonText: "START LEARNING",
                onConfirm: function() {
                    window.location.href = "learn.html";
                }
            });
        } else {
            $(".login-box").addClass("shake-error");
            setTimeout(function() {
                $(".login-box").removeClass("shake-error");
            }, 500);
            
            showDuoModal({
                title: "Login Failed",
                message: "Invalid email or username. Please verify your credentials and try again.",
                type: "error",
                buttonText: "TRY AGAIN"
            });
        }
    });

});




// $(document).ready(function(){

// $("#loginForm").submit(function(e){

// e.preventDefault();

// let user = $("#username").val();

// let pass = $("#password").val();

// if(user === "" || pass === ""){

// alert("Please fill all fields");

// return;

// }

// localStorage.setItem(
// "username",
// user
// );

// window.location.href =
// "dashboard.html";

// });
//});
