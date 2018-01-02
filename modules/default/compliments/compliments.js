/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("compliments", {

	// Module config defaults.
	defaults: {
		compliments: {
			anytime: [
				//"Hey there sexy!",
				"A little love, a little trust, a lot of forgiveness",
				"Be the change you wish to see in the world.",
				"Five hundred twenty-five thousand six hundred minutes",
				"Give me your own special smile",
				"Have you ever tried to eat a clock?",
 				"I am a unique child of this world.",
				"I am blessed with an incredible family and wonderful friends.",
				"I am courageous and I stand up for myself.",
 				"I draw from my inner strength and light.",
 				"I embrace the rhythm and the flowing of my own heart.",
				"I kissed your honey hair with my grateful tears.",
				"I love and approve of myself.",
 				"I love deadlines. I like the whooshing sound they make as they fly by.",
 				"I muster up more hope and courage from deep inside me.",
 				"I replace my anger with understanding and compassion.",
				"If I can't dance, I don't want to be part of your revolution",
				"It's all happening",
 				"It's up to you. You have to make the big decisions.",
				"It's very time consuming.",
				"I've gone to look for America",
				"I've had a lot of worries in my life, most of which never happened.",
				"My thoughts are filled with positivity and my life is plentiful with prosperity.",
 				"People who think they know everything are a great annoyance to those of use who do.",
				"Remember the heart is a tender thing\nRestless and hopeful It cries and sings",
				"The bright blessed day, the dark sacred night",
				"Time passes much too quickly\nWhen we're together laughing",
 				"You can't always get want you want",
				"You just call out my name\nand you know wherever I am \nI'll come runnin'\nto see you again",
				"You're talkin' a lot, but you're not sayin' anything.",
 				"Wonderful things unfold before me.",
				"Who am I, to be blind? Pretending not to see their needs",
			],
			morning: [
				//"Good morning, handsome!",
				//"Enjoy your day!",
				//"How was your sleep?"
				"I wake up today with strength in my heart and clarity in my mind.",
				"Today will be a georgeous day to remember.",
			],
			afternoon: [
				//"Hello, beauty!",
				//"You look sexy!",
				//"Looking good today!"
			],
			evening: [
				//"Wow, you look hot!",
				//"You look nice!",
				//"Hi, sexy!"
			]
		},
		updateInterval: 30000,
		remoteFile: null,
		fadeSpeed: 4000
	},

	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		if (this.config.remoteFile != null) {
			this.complimentFile((response) => {
				this.config.compliments = JSON.parse(response);
			});
		}

		// Schedule update timer.
		var self = this;
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	/* randomIndex(compliments)
	 * Generate a random index for a list of compliments.
	 *
	 * argument compliments Array<String> - Array with compliments.
	 *
	 * return Number - Random index.
	 */
	randomIndex: function(compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		var generate = function() {
			return Math.floor(Math.random() * compliments.length);
		};

		var complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;

		return complimentIndex;
	},

	/* complimentArray()
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * return compliments Array<String> - Array with compliments for the time of the day.
	 */
	complimentArray: function() {
		var hour = moment().hour();
		var compliments;

		if (hour >= 3 && hour < 12 && this.config.compliments.hasOwnProperty("morning")) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= 12 && hour < 17 && this.config.compliments.hasOwnProperty("afternoon")) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if(this.config.compliments.hasOwnProperty("evening")) {
			compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = new Array();
		}

		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}

		compliments.push.apply(compliments, this.config.compliments.anytime);

		return compliments;
	},

	/* complimentFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	complimentFile: function(callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", this.file(this.config.remoteFile), true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* complimentArray()
	 * Retrieve a random compliment.
	 *
	 * return compliment string - A compliment.
	 */
	randomCompliment: function() {
		var compliments = this.complimentArray();
		var index = this.randomIndex(compliments);

		return compliments[index];
	},

	// Override dom generator.
	getDom: function() {
		var complimentText = this.randomCompliment();

		var compliment = document.createTextNode(complimentText);
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright";
		wrapper.appendChild(compliment);

		return wrapper;
	},


	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},


	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification == "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
		}
	},

});