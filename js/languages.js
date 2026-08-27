const languages = [

{
flag:"🇪🇸",
name:"Spanish",
learners:"42M Learners"
},

{
flag:"🇫🇷",
name:"French",
learners:"23M Learners"
},

{
flag:"🇺🇸",
name:"English",
learners:"20M Learners"
},

{
flag:"🇯🇵",
name:"Japanese",
learners:"18M Learners"
},

{
flag:"🇩🇪",
name:"German",
learners:"16M Learners"
},

{
flag:"🇮🇳",
name:"Hindi",
learners:"14M Learners"
},

{
flag:"🇰🇷",
name:"Korean",
learners:"12M Learners"
},

{
flag:"🇮🇹",
name:"Italian",
learners:"10M Learners"
},

{
flag:"🇨🇳",
name:"Chinese",
learners:"9M Learners"
},

{
flag:"🇷🇺",
name:"Russian",
learners:"7M Learners"
},

{
flag:"🇵🇹",
name:"Portuguese",
learners:"4M Learners"
},

{
flag:"🇹🇷",
name:"Turkish",
learners:"3M Learners"
}

];

// Generate language cards with Bootstrap icon and flag image
function getFlagCode(name) {
  const map = {
    "Hindi": "in",
    "English": "us",
    "French": "fr",
    "German": "de",
    "Japanese": "jp",
    "Korean": "kr",
    "Spanish": "es",
    "Chinese": "cn",
    "Russian": "ru",
    "Italian": "it",
    "Portuguese": "pt",
    "Turkish": "tr"
  };
  return map[name] || "";
}

function getVariantClass(index) {
  const variants = ["card-variant-1", "card-variant-2", "card-variant-3"];
  return variants[index % variants.length];
}

function displayLanguages(list) {
  $("#languageContainer").html("");
  list.forEach((language, i) => {
    const flagCode = getFlagCode(language.name);
    const variant = getVariantClass(i);
    const cardHtml = `
      <div class="col-md-4 col-sm-6 mb-4">
        <div class="language-card ${variant}">
          <i class="bi bi-translate emoji-icon"></i>
          <img src="https://cdn.jsdelivr.net/npm/flag-icons/flags/4x3/${flagCode}.svg" class="flag flag-animate mb-2" alt="${language.name} flag" style="width:40px; height:auto;">
          <h5 class="language-name mb-1">${language.name}</h5>
          <div class="learners">${language.learners}</div>
        </div>
      </div>`;
    $("#languageContainer").append(cardHtml);
  });
}

displayLanguages(languages);

$(document).on(
"click",
".language-card",
function(){
    let selectedLang = $(this).find("h5").text().trim();
    localStorage.setItem("userLanguage", selectedLang);
    window.location.href = "select-native-language.html";
});

$("#searchBox").on("keyup",function(){

let value=$(this).val().toLowerCase();

let filtered=
languages.filter(language=>

language.name
.toLowerCase()
.includes(value)

);

displayLanguages(filtered);

});