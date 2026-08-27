$(document).ready(function(){
    // Hide validation messages initially
    $(".invalid-feedback").hide();

    // Live validation for email
    $("#email").on("input", function() {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const email = $(this).val();
        if (!emailPattern.test(email)) {
            $(this).addClass("is-invalid");
            $("#emailFeedback").show();
        } else {
            $(this).removeClass("is-invalid");
            $("#emailFeedback").hide();
        }
    });

    // Live validation for password
    $("#password").on("input", function() {
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%\^&*]).{8,}$/;
        const pwd = $(this).val();
        if (!passwordPattern.test(pwd)) {
            $(this).addClass("is-invalid");
            $("#passwordFeedback").show();
        } else {
            $(this).removeClass("is-invalid");
            $("#passwordFeedback").hide();
        }
    });

    $("#signupForm").submit(function(e){
        e.preventDefault();

        let name = $("#fullName").val().trim();
        let email = $("#email").val().trim();
        let password = $("#password").val();
        let confirmPassword = $("#confirmPassword").val();

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%\^&*]).{8,}$/;
        let emailValid = emailPattern.test(email);
        let passwordValid = passwordPattern.test(password);

        // Show inline errors if needed
        if (!emailValid) {
            $("#email").addClass("is-invalid");
            $("#emailFeedback").show();
        }
        if (!passwordValid) {
            $("#password").addClass("is-invalid");
            $("#passwordFeedback").show();
        }
        if (!emailValid || !passwordValid) {
            return; // stop submission
        }

        if (password !== confirmPassword) {
            showDuoModal({
                title: "Passwords Mismatch",
                message: "Oops! The passwords you entered do not match. Please try again.",
                type: "error",
                buttonText: "TRY AGAIN"
            });
            return;
        }

        // Store user data
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);
        localStorage.setItem("userStreak", "0");
        localStorage.setItem("userXP", "0");
        localStorage.setItem("userGems", "100");
        localStorage.setItem("userHearts", "5");

        // Show success modal then navigate
        showDuoModal({
            title: "Account Created!",
            message: `Welcome aboard, ${name}! Your learning profile has been generated. Ready to start?`,
            type: "success",
            buttonText: "CHOOSE A LANGUAGE",
            onConfirm: function() {
                window.location.href = "languages.html";
            }
        });
        // Also navigate after short delay in case user doesn't click
        // setTimeout(function(){
        //     window.location.href = "languages.html";
        // }, 2000);
    });
});