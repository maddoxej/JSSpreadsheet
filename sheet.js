function CreateTable(){
	var rows = 10;
	var columns = 8
	var sheet = document.querySelector("table#sheet")
	for (var i=0; i< rows; i++) {
		var row = sheet.insertRow(-1);
		for (var j=0; j< columns; j++) {
			var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
			row.insertCell(-1).innerHTML = i&&j ? "<input id='"+ letter+i +"'/>" : i||letter;
		}
	}
	var foot = sheet.createTFoot();
	var row = foot.insertRow(-1);
	row.insertCell(-1); // empty cell
	for (var j=1; j< columns; j++) {
		var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
		row.insertCell(-1).innerHTML = "<span id='" + letter + "Total' class='total'/>";
	}
}

var DATA={};
var INPUTS;
function Computerize(){
	INPUTS=[].slice.call(document.querySelectorAll("input"));
	INPUTS.forEach(function(elm) {
		elm.onfocus = function(e) {
			e.target.value = localStorage[e.target.id] || "";
		};
		elm.onblur = function(e) {
			localStorage[e.target.id] = e.target.value;
			computeAll();
		};
		var getter = function() {
			var value = localStorage[elm.id] || "";
			if (value.charAt(0) == "=") {
				with (DATA) {
					with (Math) {
						return eval(value.substring(1));
					}
				} 
			} else { return isNaN(parseFloat(value)) ? value : parseFloat(value); }
		};
		Object.defineProperty(DATA, elm.id, {get:getter});
		Object.defineProperty(DATA, elm.id.toLowerCase(), {get:getter});
	});
}

CreateTable();
Computerize();

(window.computeAll = function() {
    INPUTS.forEach(function(elm) { try { elm.value = DATA[elm.id]; } catch(e) {} });
	var totals = [].forEach.call(document.querySelectorAll(".total"), function(span) {
			var total = 0.0;
			for (row=1; row < 10; row ++)
			{
				var id= span.id.slice(0,1) + row;
				var val = DATA[id];
				if (typeof val=="number")
				{
				  total += DATA[id];
				}			
			}
			span.innerHTML = total;
		});
})();

function ListMathFun(){
	var funList = document.getElementById('functionList');
	Object.getOwnPropertyNames(Math).forEach(function(f) {
		if (typeof Math[f] =="function")
		{
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(f));
			funList.appendChild(li);
		}
	});
}

ListMathFun();

