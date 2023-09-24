function bulkCreate(){
	let input = document.getElementById("input").value
	let pattern = document.getElementById("pattern").value
	let outputElm = document.getElementById("output")
	
	let csv = {};
	let entry = '';
	let quoted = false;
	let begunQuoted = false;
	let endedQuoted = false;
	let partiallyQuoted = false;
	let processQuote = ()=>{
		if (quoted){
			endedQuoted = true
			quoted = false;
		} else{
			if (entry == ''){
				begunQuoted = true
			} else {
				partiallyQuoted = true;
			}
			quoted = true;
		}
	}
	let cleanEntry = ()=>{
		entry = entry.trim().slice(1, entry.length-1);
	}
	let resetParameters = ()=>{
		entry = ''
		quoted = false;
		begunQuoted = false;
		endedQuoted = false;
		partiallyQuoted = false;
	}
	// get rows
	for (let c of input.split('\n')[0]){
		if (c == '"'){
			processQuote()
		}
		if ((c == ',') && !quoted){
			if (begunQuoted && endedQuoted && !partiallyQuoted){
				cleanEntry()
			}
			csv[entry.trim()] = []
			resetParameters()
			continue;
		}
		if (c == ' ' && entry == ''){
			continue
		}
		entry += c
	}
	if (entry != ''){
		if (begunQuoted && endedQuoted && !partiallyQuoted){
			cleanEntry()
		}
		csv[entry.trim()] = []
		resetParameters()
	}

	let rows = Object.keys(csv);
	let row, rowId = 0;
	// get columns
	for (let c of input.slice(input.split('\n')[0].length + 1, input.length)){
		if (c == '"'){
			processQuote()
		}
		if ((c == ',' && !quoted) || c == '\n'){
			if (begunQuoted && endedQuoted && !partiallyQuoted){
				cleanEntry()
			}
			row = rows[rowId]
			csv[row].push(entry.trim());
			rowId = (rowId + 1)% rows.length;
			if (c == '\n'){
				rowId = 0
			}

			resetParameters()
			continue;
		}
		if (c == ' ' && entry == ''){
			continue
		}
		entry += c
	}
	if (entry != ''){
		if (begunQuoted && endedQuoted && !partiallyQuoted){
			cleanEntry()
		}
		row = rows[rowId]
		csv[row].push(entry.trim());
	}
	
	// apply pattern
	let readingVariable = false;
	let staticEntry = '';
	let variableEntry = '';
	let columnsSize = input.split('\n').length - 1
	let bulkCreation = [];
	for (let i = 0; i<columnsSize; i++){
		bulkCreation.push('');
	}
	for (let c of pattern){
		if (c == "{" && !readingVariable){
			readingVariable = true;
			for (let i in bulkCreation){
				bulkCreation[i] += staticEntry;
			}
			staticEntry = '';
		}
		if (readingVariable){
			variableEntry += c;
			if (c == "}"){
				readingVariable = false;
				variableEntry = variableEntry.slice(1, variableEntry.length - 1).trim();
				if (rows.indexOf(variableEntry) != -1){
					for (let columnId in csv[variableEntry]){
						bulkCreation[columnId] += csv[variableEntry][columnId];
					}
				} else{
					for (let i in bulkCreation){
						bulkCreation[i] += '{' + variableEntry + '}';
					}
				}
				variableEntry = '';
			}
		} else{
			staticEntry += c;
		}
	}
	if (staticEntry != ''){
		for (let i in bulkCreation){
			bulkCreation[i] += staticEntry;
		}
	}
	
	outputElm.readOnly = false
	outputElm.value = bulkCreation.join("\n");
	outputElm.readOnly = true
	document.getElementById("count").textValue = bulkCreation.length;
}