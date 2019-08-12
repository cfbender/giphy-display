/*
    GIPHY API Search
    cfbender
*/

const topics = [
	"trending",
	"dab",
	"awkward",
	"surprised",
	"clapping",
	"confused",
	"wink"
];

//loops to display buttons for default terms
for (let item of topics) {
	let button = $("<button>")
		.addClass("search")
		.attr("data-search", item)
		.text(item);
	$("#default-terms").append(button);
}

//number of gifs to return from the API
const searchLimit = 10;
//number of search terms to show on the screen
const buttonLimit = 5;
//check local storage for terms array or create blank one
let newTerms = JSON.parse(localStorage.getItem("newTerms")) || [];

//constructor function to add result to object
function Result(image, text, rating, button) {
	this.image = image;
	this.text = text;
	this.rating = rating;
	this.button = button;
}

//initializing our global results object. will hold objects from constructor function
let globalResults = {};

//handles ajax and response storage
gifSearch = query => {
    let search = query;

	if (search === "trending") {
		var queryURL =
			"https://api.giphy.com/v1/gifs/trending?api_key=0xw1pbgrqt6NlvNX3L3cUhvHXcVSTVFN&limit=" +
			searchLimit;
	} else {
		var queryURL =
			"https://api.giphy.com/v1/gifs/search?q=" +
			search +
			"&api_key=0xw1pbgrqt6NlvNX3L3cUhvHXcVSTVFN&limit=" +
			searchLimit;
	}

	// Performing an AJAX request with the queryURL
	$.ajax({
		url: queryURL,
		method: "GET"
	}).then(response => {
        let results = response.data;
        console.log(results);
		//empty out previous results
		$("#gif-display").empty();
		//keep track of which result we are displaying
		let i = 1;

		//loop through results to create DOM elements with them
		for (let gif of results) {
			// let resultDiv = $("<div>").attr("data-number", i);
			let image = $("<img>").attr("src", gif.images.fixed_height.url);

			let urlText = $("<input>")
				.attr("type", "text")
				.attr("value", gif.bitly_gif_url)
                .addClass("url-text");
            let ratingText = gif.rating;
            ratingText = ratingText.toUpperCase();
            let rating = $("<p>").text("Rating: " + ratingText)
			let copyButton = $("<button>")
				.html("<img src ='./assets/images/document.png' id = 'clip-image'>")
				.addClass("clipboard-copy");

            //store our DOM elements in a global result object
			globalResults[i] = new Result(image, urlText, rating, copyButton);

			//increment our counter
			i++;
		}

		//display first item
        resultChanger(1);
        $(".search-nav").show();
        $("#gif-display").show();
	});
};

//handles adding term to newTerms and storing array
const addTerm = term => {
	if (newTerms.unshift(term) > 5) {
		newTerms.pop();
	}
	localStorage.setItem("newTerms", JSON.stringify(newTerms));
	$("#new-searches").empty();
	buttonDisplay();
};

// loops through buttons in newTerms to display them
const buttonDisplay = () => {
	for (let item of newTerms) {
		let button = $("<button>")
			.addClass("search")
			.attr("data-search", item)
			.text(item);
		$("#new-searches").append(button);
	}
	if (newTerms.length > 0) {
        $("#new-searches").append(
		$("<button>")
			.attr("id", "clear-terms")
			.text("CLEAR")
        );
    }
};

//displays the gif of parameter ID
const resultChanger = newID => {
    //create a new div to hold our gif and info
	let resultDiv = $("<div>")
		.attr("data-number", newID)
		.attr("id", "displayed-gif");
	let image = $("<div>").html(globalResults[newID].image).addClass("gif-container");
    resultDiv.append(image);
    let imageLinkContainer = $("<div>").append(globalResults[newID].text).append(globalResults[newID].button).addClass("image-link")
    resultDiv.append(imageLinkContainer);
    let ratingContainer = $("<div>").attr("id", "rating-container").html(globalResults[newID].rating)
    resultDiv.append(ratingContainer);
	$("#gif-display").empty();
	$("#gif-display").append(resultDiv);
	$("#result-count").text(newID + " of " + searchLimit);
};

//adds new button and search term
$("#add-gif").click(function() {
	let query = $("#search-input").val();
	$("#search-input").val("");
	addTerm(query);
	gifSearch(query);
});

// goes back in results
$("#previous").click(function() {
    let id = $("#displayed-gif").attr("data-number");
    //only go back if there is one to go back to
	if (id > 1) {
		id--;
		resultChanger(id);
	}
});

//goes to next result
$("#next").click(function() {
    let id = $("#displayed-gif").attr("data-number");
    //only go forward if there is one to go forward to
	if (id < 10) {
		id++;
		resultChanger(id);
	}
});

//runs search from button click
$(document).on("click", ".search", function() {
	let query = $(this).attr("data-search");
	gifSearch(query);
});

//clears out previously added terms
$(document).on("click", "#clear-terms", function() {
	$("#new-searches").empty();
	newTerms = [];
	localStorage.setItem("newTerms", JSON.stringify(newTerms));
});

//boolean to prevent multiple animations
let copied = false;

//copies link to clipboard
$(document).on("click", ".clipboard-copy", function() {
	$(".url-text").select();
	if (document.execCommand("copy")) {
		if (!copied) {
            copied = true;
			let thumb = $("<img>")
				.attr("src", "./assets/images/like.png")
				.addClass("copy-success")
				.hide();
			$("#displayed-gif").append(thumb);
			$(".copy-success")
				.fadeIn(500)
				.delay(1000)
				.fadeOut(1000);
			$(".copy-success")
				.promise()
				.done(() => {
                    $(".copy-success").remove()
                    copied = false;
				});
		}
	}
});

//display buttons from storage
buttonDisplay();
