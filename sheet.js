(function(){

var Rows = 10;
var Columns = 8

function CreateTable(){
	var sheet = document.querySelector("table#sheet")
	for (var i=0; i< Rows; i++) {
		var row = sheet.insertRow(-1);
		for (var j=0; j< Columns; j++) {
			var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
			row.insertCell(-1).innerHTML = i&&j ? "<input id='"+ letter+i +"'/>" : i||letter;
		}
	}
	var foot = sheet.createTFoot();
	var row = foot.insertRow(-1);
	row.insertCell(-1); // empty cell
	for (var j=1; j< Columns; j++) {
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
			e.target.OldValue = e.target.value;
			e.target.value = localStorage[e.target.id] || "";
			e.target.onchange = function(e){e.target.Changed = true;};
		};
		elm.onblur = function(e) {
			e.target.onchange = null;
			if (e.target.Changed){
				e.target.Changed = false;
				localStorage[e.target.id] = e.target.value;
				computeAll();
			}
			else
			{
				e.target.value = e.target.OldValue;
			}
		};
		var getter = function() {
			var enteredValue = localStorage[elm.id] || "";
			var calculatedValue;
			if (enteredValue.charAt(0) == "=") {
				calculatedValue = EvaluateConcat(enteredValue.slice(1));
			} else {
				calculatedValue = enteredValue;
			}
			
			return StringOrNumber(calculatedValue);
		};
		Object.defineProperty(DATA, elm.id, {get:getter});
		Object.defineProperty(DATA, elm.id.toLowerCase(), {get:getter});
	});
}

// ensure that string values are stored as strings and numbers are stored as numbers. 
function StringOrNumber(value){
	// parseFloat would return 12.3 as a number given an input of "12.3 hours" I want to keep it as a string. 
	if (value.match(/^\s*(([-+]?\d+(\.\d+)?)([eE][+-]?\d{1,2})?)\s*$/))
	{
		return isNaN(parseFloat(value)) ? value : parseFloat(value);
	}
	else
	{
		return value;
	}
}

function EvaluateRange(value){
	var unranged = value.replace(/([a-z]|[A-Z])(\d{1,2})\:([a-z]|[A-Z])(\d{1,2})/g, 
		function(match, startLetter, startDigit, endLetter, endDigit, offset, s) {
			var startCol = startLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0) + 1;
			var endCol = endLetter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0) + 1;
			var startRow = parseInt(startDigit);
			var endRow = parseInt(endDigit);
			if (startCol > endCol || startCol > Columns)
			{
				return match;
			}
			
			if (endCol > Columns)
			{
				return match;
			}
			
			if (endRow > Rows)
			{
				return match;
			}
			
			var result = [];
			
			for (var row = startRow; row <= endRow; row++)
			{
				for (var col = startCol; col <= endCol; col++)
				{
					var letter = String.fromCharCode("A".charCodeAt(0)+col-1);
					var id = letter + row;
					result.push(id);
				}
			}
			
			return result.join(',');		
		});
	
	return Evaluate(unranged);
}

// Expressions may have an "&" to concatenate two string values. like =E5 & " hours"
function EvaluateConcat(value){
	var values = value.split('&');
	return values.map(function(currentValue, currentIndex, array){
		return EvaluateRange(currentValue);
	}).join('');
}

function Evaluate(value){
	with (DATA) {
		with (Math) {
			return eval(value);
		}
	} 
}

CreateTable();
Computerize();

(window.computeAll = function() {
    INPUTS.forEach(function(elm) { try { elm.value = DATA[elm.id]; } catch(e) {} });
	var totals = [].forEach.call(document.querySelectorAll(".total"), function(span) {
			var total = 0.0;
			for (row=1; row < Rows; row ++)
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

})();