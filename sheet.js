(function(){

var localStorage = window.localStorage || {};

var Rows = localStorage.Rows || Math.floor((window.innerHeight - 100) / 22);
var Columns = localStorage.Columns || Math.max(2, Math.floor((window.innerWidth - 14) / 182) + 1);
localStorage.Rows = Rows;
localStorage.Columns = Columns;


function CreateTable(){
	var sheet = document.querySelector("table#sheet")
	var headerRow = sheet.insertRow(-1);
	var cornerCell = headerRow.insertCell(-1);
	var hiddenSpan =  "<span class='hiddenForClipboard'></span>";
	
	for (var j=1; j< Columns; j++) {
		var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
		headerRow.insertCell(-1).innerHTML = letter;
	}
	
	for (var i=1; i< Rows; i++) {
		var row = sheet.insertRow(-1);
		row.insertCell(-1).innerHTML = i;
		for (var j=1; j< Columns; j++) {
			var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
			row.insertCell(-1).innerHTML = "<input id='"+ letter+i +"'/>" + hiddenSpan;
		}
	}
	
	var foot = sheet.createTFoot();
	var row = foot.insertRow(-1);
	row.insertCell(-1).innerHTML="&Sigma;";
	for (var j=1; j< Columns; j++) {
		var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
		row.insertCell(-1).innerHTML = "<span id='" + letter + "Total' class='total'></span>";
	}
}

var DATA={};
var INPUTS;
function Computerize(){
	INPUTS=[].slice.call(document.querySelectorAll("#sheet input"));
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
				e.target.title = null; // clear any error message. 
				computeAll();
			}
			else
			{
				e.target.value = e.target.OldValue;
			}
		};
		var getter = function() {
			var storedValue = localStorage[elm.id] || "";
			var calculatedValue;
			if (storedValue.charAt(0) == "=") {
				try{
					calculatedValue = EvaluateConcat(storedValue.slice(1));
				}
				catch (e)
				{
					calculatedValue = "#Error"; 
					elm.title = e;
					console.log("Error in " + elm.id + " '" + e + "' calculating " + storedValue)
				}
			} else {
				calculatedValue = storedValue;
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
				throw "invalid range. start > end";
			}
			
			if (endCol > Columns)
			{
				endCol = Columns;
			}
			
			if (endRow > Rows)
			{
				endRow = Rows;
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
	function SUM(){
		var total = 0.0;
		for(var i = 0; i < arguments.length; i++)
		{	
			var val = arguments[i];
			if (typeof val=="number")
			{
				total += val;
			}
		}
		
		return total;
	}
	
	// lowercase version
	var sum = SUM; 
	with (DATA) {
		with (Math) {
			return eval(value);
		}
	} 
}

CreateTable();
Computerize();

(window.computeAll = function() {
    INPUTS.forEach(function(elm) { 
		try { 
			// call the getter, display the calculated value. 
			elm.value = DATA[elm.id]; 
			if (elm.nextSibling){
				// update a hidden span for copying to the clipboard. 
				elm.nextSibling.textContent=String(elm.value);
			}
		} catch(e) {
			console.log(e);
		}
	});
	var totals = [].forEach.call(document.querySelectorAll(".total"), function(span) {
			var total = 0.0;
			for (var row=1; row < Rows; row ++)
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