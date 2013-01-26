var counterClasses = 1;
var counterEvents = 1;
var courses = new Array();
var events = new Array();

function addInput(divName) {
    if (divName == "classes") {
        var title = "Class";
        var newdiv = document.createElement('div');
        var namer = "classes" + (counterClasses + 1);
        newdiv.setAttribute("id", namer);
        newdiv.innerHTML = title + " " + (counterClasses + 1) + "&nbsp;&nbsp;&nbsp;<input type='text' name=" + namer + ">";
        document.getElementById(divName).appendChild(newdiv);
        counterClasses++;
    }
};

function toggleAllDays(checkbox) {
    console.log(checkbox.checked);
    $("#events > div > input").each(function (i, obj) {
        if (obj.name.indexOf("days") != -1) {
            obj.checked = checkbox.checked;
        }
    });
}

function submit1() {
    var shouldSubmit = true;

    //Checking data here:
    courses = new Array();
    events = new Array();
    $("#classes > div > input").each(function (i, obj) {
        if (obj.type == "text") {
            if (obj.name.indexOf("class") != -1) {
                obj.style.backgroundColor = "#FFFFFF";
                var trimmedValue = obj.value.trim().toUpperCase();
                if (trimmedValue != "") {
                    if (isValidCourse(trimmedValue) && existsInRegistrar(trimmedValue)) {
                        courses.push(trimmedValue);
                    } else {
                        obj.style.backgroundColor = "#FF6666";
                        shouldSubmit = false;
                    }
                }
            }
        }
    });
    // console.log(courses);

    var customEvent = new Object();
    $("#events > div").each(function (i, obj) {
        customEvent.days = new Array();
        $("input").each(function (i2, obj2) {
            if (obj2.name.indexOf("day") != -1) {
                if (obj2.checked == true) {
                    (customEvent.days).push(obj2.value);
                }
            }
        });
        $("select").each(function (i2, obj2) {
            if (obj2.name.indexOf("starth") != -1) {
                $("option", this).each(function (i5, obj5) {
                    // console.log(obj5.selected);
                    if (obj5.selected == true) {
                        customEvent.starth = obj5.value;
                    }
                });
            } else if (obj2.name.indexOf("startm") != -1) {
                $("option", this).each(function (i5, obj5) {
                    if (obj5.selected == true) {
                        customEvent.startm = obj5.value;
                    }
                });
            } else if (obj2.name.indexOf("startampm") != -1) {
                $("option", this).each(function (i6, obj6) {
                    if (obj6.selected == true) {
                        customEvent.startampm = obj6.value;
                    }
                });
            } else if (obj2.name.indexOf("endh") != -1) {
                $("option", this).each(function (i7, obj7) {
                    if (obj7.selected == true) {
                        customEvent.endh = obj7.value;
                    }
                });
            } else if (obj2.name.indexOf("endm") != -1) {
                $("option", this).each(function (i8, obj8) {
                    if (obj8.selected == true) {
                        customEvent.endm = obj8.value;
                    }
                });
            } else if (obj2.name.indexOf("endampm") != -1) {
                $("option", this).each(function (i9, obj9) {
                    if (obj9.selected == true) {
                        customEvent.endampm = obj9.value;
                    }
                });
            }
            // console.log(obj2);
        });
        events.push($.extend(true, {}, customEvent));
    });
    // console.log(events);

    if (shouldSubmit) {
        processCourseStrings(courses, customEvent, $("#primaryCompare").val(), $("#secondaryCompare").val());
    }
}