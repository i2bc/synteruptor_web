function print_db(type='databases',userdb=false,id="databases") {
	pars = {};
	pars.type = type;
	pars.userdb = userdb;
	loading_on();
	$.getJSON( urls.get_data, pars, function(data) {
		error_msg = check_data_error(data);
		if (error_msg) {
			$( "#" + id ).append( error_msg );
		} else {
			// Convert the object of objects to an array of objects and add 
			// the key as an extra parameter of each object so as not to lose it
			const arrayOfObjects = Object.keys(data).map(key => {
				return { key, ...data[key] };
			});
			// Sort the array based on the date values in descending order
			arrayOfObjects.sort(function(a, b) {
				if (a.date < b.date) {return 1;}
				if (b.date < a.date) {return -1;}
				return 0;
			});
			// Convert the sorted array back to an object of objects	
			data = arrayOfObjects.reduce((obj, item) => {
				obj[item.key] = { description: item.description, author: item.author, date: item.date, num: item.num };
				return obj;
			}, {});
			console.log(data);
			print_db_table(data,id=id);
		}
		loading_off();
	}).fail(function(){
		console.log("Failed databases retrieval");
		loading_off();
	});
}

function check_data_error( data ) {
	error_msg = ""
	if ("outcome" in data && data["outcome"] == false) {
		console.log("Error occurred: " + data["details"]);
		error_msg = $("<p />").text("An error occurred: " + data["message"] + ". Check the console for more details.");
	}
	return error_msg;
}

function get_dbs() {
	var dbs = {};
	
}

function print_db_table( dbs, id="databases" ) {
	var table = $( "<table />" );
	table.append( write_db_head() );
	
	for ( var db in dbs ) {
		var data = dbs[ db ];
		data.db = db;
		var row = write_db_line( db, data );
		table.append( row );
	}
	$( "#" + id ).append( table );
}

var dbs_headers = {
       "db" : "Name",
       "num" : "Size",
       "description" : "Description",
       "date" : "Date",
       "author" : "Author",
};

function write_db_head() {
	var row = $( "<tr />" );
	for (head in dbs_headers) {
		var cell = $( "<th />" ).text( dbs_headers[ head ] );
		row.append( cell );
	}
	return row;
}
function write_db_line( db, data ) {
	//var row = $( "<tr />" );
	var link = urls.summary + "?" + $.param( { 'version': db } );
	var row = $( "<a />" )
	       .attr( "href", link )
	       .attr( "title", "Explore the database " + db )
	       .attr( "class", "table-row" );
	for (head in dbs_headers) {
		var content = "";
		if ( data[ head ] ) {
			content = data[ head ];
		} else if ( head == "db" ) {
			content = db;
		}
		var cell = $( "<td />" ).text( content );
		row.append( cell );
	}
	return row;
}

// First actions!
$(function() {
	if ($("#databases")) {
		print_db(type='databases',userdb=false,id="databases");
	}
	if ($("#userdatabases")) {
		print_db(type='userdatabases',userdb=false,id="userdatabases");
	}
});

