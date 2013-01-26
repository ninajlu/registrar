var registrarData = $.parseJSON(registrarDataString);

var courseData = new Array();

for (var i = 0; i < registrarData.length; i++) {
	var section = registrarData[i];
	var department = section.dept;
	var courseNumber = section.courseNumber;
	
	if (!(department in courseData)) {
		courseData[department] = new Array();
	}

	if (!(courseNumber in courseData[department])) {
		courseData[department][courseNumber] = new Array();
	}

	var sectionObject = new Object();

	sectionObject.department = department;
	sectionObject.courseNumber = courseNumber;

	sectionObject.building = section.building;
	sectionObject.credits = section.credits;
	sectionObject.days = section.days;

	sectionObject.startTime = parseFloat(section.hours[0].replace(":30", ".5"));
	sectionObject.endTime = parseFloat(section.hours[1].replace(":30", ".5"));

	// Convert times to 24-hour time
	if (section.times.charAt(section.times.length - 2) == 'P') {
		if(sectionObject.endTime != 12.5) {
			sectionObject.endTime += 12;
		}
		if(sectionObject.endTime - sectionObject.startTime > 12) {
			sectionObject.startTime += 12;
		}
	}

	sectionObject.professor = section.prof;
	sectionObject.roomNumber = section.roomNumber;
	sectionObject.sectionNumber = section.sectionNumber;
	sectionObject.times = section.times;
	sectionObject.title = section.title;
	sectionObject.type = section.type;

	courseData[department][courseNumber].push(sectionObject);
}

console.log(courseData);

var courseRegex = /^([A-Z]+)[^A-Z\d]*(\d{3})$/;

function isValidCourse(input) {
	return courseRegex.test(input.trim());
}

function parseCourse(input) {
	var result = courseRegex.exec(input.trim());
	// console.log(result.join(","));
	// console.log(result.slice(1, 3).join(","));
	return result.slice(1, 3);
}

function existsInRegistrar(input) {
	if (!isValidCourse(input)) {
		return false;
	}
	var course = parseCourse(input);
	var department = course[0];
	var courseNumber = course[1];
	return (department in courseData) && (courseNumber in courseData[department]);
}

function splitSectionsByType(sections) {
	var array = new Array();
	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		if (!(section.type in array)) {
			array[section.type] = new Array();
		}
		array[section.type].push(section);
	}
	return array;
}

function getSectionGroups(courseStrings) {
	var sectionGroups = new Array();
	for (var i = 0; i < courseStrings.length; i++) {
		var course = parseCourse(courseStrings[i]);
		var department = course[0];
		console.log(course);
		var courseNumber = course[1];
		var sectionsByType = splitSectionsByType(courseData[department][courseNumber]);
		for (type in sectionsByType) {
			console.log(department + " " + courseNumber+ " " + type + ":");
			console.log(sectionsByType[type]);
			sectionGroups.push(sectionsByType[type]);
		}
	}
	sectionGroups.sort(
		function (s1, s2) {
			return s1.length - s2.length;
		}
	);
	return sectionGroups;
}

var days = {"monday": 0, "tuesday": 0, "wednesday": 0, "thursday": 0, "friday": 0};

function findSchedules(sectionGroups) {
	var filledSlots = new Array();
	for(var day in days) {
		filledSlots[day] = new Array();
		for(var time = 0; time < 24; time += 0.5) {
			filledSlots[day][time] = 0;
		}
	}
	var validSchedules = new Array();
	findSchedulesHelper(sectionGroups, 0, new Array(), filledSlots, validSchedules);
	console.log(validSchedules);
	return validSchedules;
}

function findSchedulesHelper(sectionGroups, currentGroup, currentSchedule, filledSlots, validSchedules) {
	// Cap number of generated schedules at 100000
	if (validSchedules.length >= 100000) {
		return;
	}

	// Found a valid schedule
	if (currentGroup == sectionGroups.length) {
		scheduleObject = new Object();

		scheduleObject.schedule = currentSchedule.slice(0);
		
		scheduleObject.filledSlots = new Array();
		for (var day in days) {
			scheduleObject.filledSlots[day] = filledSlots[day].slice(0);
		}

		computeScheduleStatistics(scheduleObject);

		validSchedules.push(scheduleObject);

		return;
	}

	for(var i = 0; i < sectionGroups[currentGroup].length; i++) {
		var section = sectionGroups[currentGroup][i];
		if (canAddSection(filledSlots, section)) {
			currentSchedule.push(section);
			fillSlots(filledSlots, section);
			findSchedulesHelper(sectionGroups, currentGroup + 1, currentSchedule, filledSlots, validSchedules);
			clearSlots(filledSlots, section);
			currentSchedule.pop();
		}
	}
}

function canAddSection(filledSlots, section) {
	for (var i = 0; i < section.days.length; i++) {
		for (var time = section.startTime; time < section.endTime; time += 0.5) {
			if (filledSlots[section.days[i]][time] == 1) {
				return false;
			}
		}
	}
	return true;
}

function fillSlots(filledSlots, section) {
	for (var i = 0; i < section.days.length; i++) {
		for (var time = section.startTime; time < section.endTime; time += 0.5) {
			filledSlots[section.days[i]][time] = 1;
		}
	}
}

function clearSlots(filledSlots, section) {
	for (var i = 0; i < section.days.length; i++) {
		for (var time = section.startTime; time < section.endTime; time += 0.5) {
			filledSlots[section.days[i]][time] = 0;
		}
	}
}

function computeScheduleStatistics(scheduleObject) {
	// scheduleObject.schedule
	// scheduleObject.filledSlots

	var schedule = scheduleObject.schedule;

	var earliestStartTime = 24;
	var latestEndTime = 0;

	var averageStartTime = 0;
	var averageEndTime = 0;

	for (var i = 0; i < schedule.length; i++) {
		var section = schedule[i];
		earliestStartTime = Math.min(earliestStartTime, section.startTime);
		latestEndTime = Math.max(latestEndTime, section.endTime);
		averageStartTime += section.startTime;
		averageEndTime += section.endTime;
	}

	averageStartTime /= schedule.length;
	averageEndTime /= schedule.length;

	scheduleObject.earliestStartTime = earliestStartTime;
	scheduleObject.latestEndTime = latestEndTime;

	scheduleObject.averageStartTime = averageStartTime;
	scheduleObject.averageEndTime = averageEndTime;

	scheduleObject.gapCount = 0;
	scheduleObject.daysWithClasses = 5;
	for (var day in days) {
		var startTime = 24;
		var endTime = 0;
		var gapCount = 0;
		for (var time = 0; time < 24; time += 0.5) {
			if (scheduleObject.filledSlots[day][time] == 0) {
				gapCount++;
			}
			else if (scheduleObject.filledSlots[day][time] == 1) {
				startTime = Math.min(startTime, time);
				endTime = Math.max(endTime, time);
			}
		}
		if (startTime == 24 && endTime == 0) {
			gapCount = 0;
			scheduleObject.daysWithClasses--;
		} else {
			gapCount -= 2*startTime;
			gapCount -= 2*(24 - endTime);
		}
		scheduleObject.gapCount += gapCount;
	}
}

function scheduleToHTML(scheduleObject) {
	var schedule = scheduleObject.schedule;
	var earliestStartTime = scheduleObject.earliestStartTime;
	var latestEndTime = scheduleObject.latestEndTime;

	var table = new Array();
	
	for (var day in days) {
		table[day] = new Array();
		for (var time = earliestStartTime; time < latestEndTime; time += 0.5) {
			table[day][time] = ["", 1, [255, 255, 255]];
		}
	}

	var hueIncrement = 300 / schedule.length;
	var currentHue = 0;

	for (var i = 0; i < schedule.length; i++) {
		var section = schedule[i];
		var cellText = section.department + " " + section.courseNumber + " " + section.sectionNumber;
		var numRows = (section.endTime - section.startTime) * 2;
		var rgb = hsvToRgb(currentHue / 360, 1, 1);
		var transparentRgb = rgbaToRgb(rgb[0], rgb[1], rgb[2], 0.3);
		// var randomRgb = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)];
		for (var j = 0; j < section.days.length; j++) {
			table[section.days[j]][section.startTime] = [cellText, numRows, transparentRgb];
			for (var time = section.startTime + 0.5; time < section.endTime; time += 0.5) {
				table[section.days[j]][time][1] = 0;
			}
		}
		currentHue += hueIncrement;
	}

	console.log(table);

	var htmlString = "";

	var tdWithStyle = "<td style=\"border:1px solid; padding-left:10px; padding-right:10px\">";

	htmlString += "<table align=\"center\" style=\"width:675px; border:3px solid; border-collapse:collapse\">";
	htmlString += "<tr>";
	htmlString += tdWithStyle + "</td>"
	for (var day in days) {
		htmlString += tdWithStyle + day.charAt(0).toUpperCase() + day.slice(1) + "</td>";
	}
	htmlString += "</tr>";
	for (var time = earliestStartTime; time < latestEndTime; time += 0.5) {
		htmlString += "<tr>";
		htmlString += tdWithStyle + Math.floor(time <= 12.5 ? time : time - 12) + (time % 1 == 0 ? ":00" : ":30") + "</td>";
		for (var day in days) {
			var numRows = table[day][time][1];
			var rgb = table[day][time][2].join(",");
			if (numRows != 0) {
				htmlString += "<td rowspan=\"" + numRows + "\" style=\"border:1px solid; padding-left:10px; padding-right:10px; background-color:rgb(" + rgb + ")\">" + table[day][time][0] + "</td>";
			}
		}
		htmlString += "</tr>";
	}

	return htmlString;
}

function printSchedule(schedule) {
	console.log("Schedule:");
	for (var i = 0; i < schedule.length; i++) {
		var section = schedule[i];
		console.log(section.department + " " + section.courseNumber + " " + section.sectionNumber + " at " + section.times);
	}
	console.log("\n");
}

function compareEarly(s1, s2) {
	var result = s1.latestEndTime - s2.latestEndTime;
	if (result == 0) {
		return s1.averageEndTime - s2.averageEndTime;
	}
	return result;
}

function compareLate(s1, s2) {
	var result = s2.earliestStartTime - s1.earliestStartTime;
	if (result == 0) {
		return s2.averageStartTime - s1.averageStartTime;
	}
	return result;
}

function compareCompact(s1, s2) {
	var spread1 = s1.latestEndTime - s1.earliestStartTime;
	var spread2 = s2.latestEndTime - s2.earliestStartTime;
	return spread1 - spread2;
}

function compareMinGaps(s1, s2) {
	return s1.gapCount - s2.gapCount;
}

function compareMinDays(s1, s2) {
	return s1.daysWithClasses - s2.daysWithClasses;
}

function sortSchedules(schedules, primaryCompare, secondaryCompare) {
	schedules.sort(
		function(s1, s2) {
			var primaryResult = primaryCompare(s1, s2);
			return (primaryResult == 0) ? secondaryCompare(s1, s2) : primaryResult;
		}
	);
}