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
function Result(image, text, button) {
	this.image = image;
	this.text = text;
	this.button = button;
}

//initializing our results object
let globalResults = {};

gifSearchDisplay = query => {
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
			let copyButton = $("<button>")
				.html("<img src ='./assets/images/document.png' id = 'clip-image'>")
				.addClass("clipboard-copy");

			globalResults[i] = new Result(image, urlText, copyButton);

			//increment our counter
			i++;
		}

		//display first item
		resultChanger(1);
	});
};

const addTerm = term => {
	if (newTerms.unshift(term) > 5) {
		newTerms.pop();
	}
	localStorage.setItem("newTerms", JSON.stringify(newTerms));
	$("#new-searches").empty();
	buttonDisplay();
};

const buttonDisplay = () => {
	for (let item of newTerms) {
		let button = $("<button>")
			.addClass("search")
			.attr("data-search", item)
			.text(item);
		$("#new-searches").prepend(button);
	}
	$("#new-searches").append(
		$("<button>")
			.attr("id", "clear-terms")
			.text("CLEAR")
	);
};

const resultChanger = newID => {
	let resultDiv = $("<div>")
		.attr("data-number", newID)
		.attr("id", "displayed-gif");
	let image = globalResults[newID].image;
	resultDiv.append(image);
	resultDiv.append(globalResults[newID].text);
	resultDiv.append(globalResults[newID].button);
	$("#gif-display").empty();
	$("#gif-display").append(resultDiv);
	$("#result-count").text(newID + " of " + searchLimit);
};

$("#add-gif").click(function() {
	let query = $("#search-input").val();
	$("#search-input").val("");
	addTerm(query);
	gifSearchDisplay(query);
});

$("#previous").click(function() {
	let id = $("#displayed-gif").attr("data-number");
	if (id > 1) {
		id--;
		resultChanger(id);
	}
});

$("#next").click(function() {
	let id = $("#displayed-gif").attr("data-number");
	if (id < 10) {
		id++;
		resultChanger(id);
	}
});

$(document).on("click", ".search", function() {
	let query = $(this).attr("data-search");
	gifSearchDisplay(query);
});

$(document).on("click", "#clear-terms", function() {
	$("#new-searches").empty();
	newTerms = [];
	localStorage.setItem("newTerms", JSON.stringify(newTerms));
});

let copied = false;
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
