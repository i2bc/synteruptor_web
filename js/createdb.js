urls.stat = 'createdb_status.php';
var wait_delay = 10000;

function status_checker(id) {
	var pars = {
		"id": id,
		"command": "check",
	};
	// Check the status a first time to see if the building is already started/finished
	$.getJSON( urls.stat, pars, function( config ) {
		if (config.status == 'preparation') {
			start_button(id);
		} else {
			continuous_check(id);
		}
	});
}

function start_button(id) {

	$form = $("<form id='mailform' style='text-align:left;' />");
	$btol = $("<span><label for='btol'>Blocks tolerance: </label><input type='num' name='btol' class='btol' value=2 min=0 max=5 style='width:3em' /> genes gap allowed between pairs of orthologs in blocks (strict: 0)</span>");
	$form
		.append("<span>Finalization:</span><br>")
		.append($btol)
		.append("<br>")
		.append( $("<label for='mail'>Mail: </label><input type='text' class='mail' name='mail' class='mail' placeholder='E-mail address to get results (optional)' style='width:30em' />") )
		.append( $("<br /><label for='author'>Author: </label><input type='text' class='author' name='author' class='author' placeholder='Author name(s) (optional)' style='width:30em' />") )
		.append( $("<br /><label for='description'>Description: </label><input type='text' class='description' name='description' class='description' placeholder='Description (optional)' style='width:30em' />") );
	$form.append("<br>");
	$button = $("<button type='submit' />")
		.text("Start building the database with these genomes");
	$form.append($button);

	$("#building").append($form);

	validator = $( "#mailform" ).validate({
		rules: {
			mail: {
				required: false,
				email: true
			},
			description: {
				required: false
			},
			author: {
				required: false
			},
			btol: {
				required: true
			}
		},
		submitHandler: function(form) {
			$(this).attr("disabled", "disabled");
			start(id);
		}
	});
}

function run_qsub(id) {
	// run send_qsub.php to submit job to cluster
	var qsub_url = format_url( urls.qsub, { 'id': id, 'run_script': "run_migenis.sh" } );
	$.ajax({
		url : qsub_url
	 }).done(function(data){
		console.log(data);
	 });
}

function start(id) {
	var pars = {
		"id": id,
		"command": "start",
	};
	pars.mail = $(".mail").val();
	pars.author = $(".author").val();
	pars.description = $(".description").val();
	pars.btol = $(".btol").val();
	$("#addmore").closest("li").remove();
	$("#uploader").remove();
	$.get( urls.stat, pars, function( stat ) {
		run_qsub(id); // inspired by adeneo's comment, https://stackoverflow.com/questions/16941138/jquery-button-onclick-run-system-command
		continuous_check(id);
	});
}

function continuous_check(id) {
	$("#addmore").closest("li").remove();
	$("#uploader").remove();
	var pars = {
		"id": id,
		"command": "check",
	};
	$.getJSON( urls.stat, pars, function( config ) {
		$('#building')
			.empty()
			.html("Status: " + config.status);
		if (config.status == 'built') {
			finish(id);
		} else if (config.status == "error") {
			if (config.details) {
				console.log("Error encountered: " + config.details);
			}
			// Don't continue!
		} else if (config.status == "failed") {
			if (config.details) {
				console.log("Error encountered: " + config.details);
			}
			if (config.trace) {
				trace_str = config.trace.replaceAll("\n", "<br />");
				trace_box = $("<div />").attr("class", "subbox");
				trace_title = $("<div />").attr("class", "boxtitle").text("Log trace...");
				trace_content = $("<div />").attr("class", "boxcontent").attr("id", "trace_content").html(trace_str);
				trace_box.append(trace_title).append(trace_content);
				$('#building').append(trace_box);
				hide_boxes();
			}
		} else {
			window.setTimeout(function() {
				continuous_check(id);
			}, wait_delay);
		}
	});
}

function finish(id) {
	$("#uploader").remove();
	var summary = $("<a />")
		.attr("href", urls.summary + "?version=" + id)
		.text("Explore your database");
	// var $list = $("<ul />");
	// $list.append( $( "<li />" ).append(summary) );
	$("#building").empty()
		.append( $("<p />").text("The database is ready:") )
		.append( summary )
		.append( $("<p />").text("/!\\ note that user databases older than 30 days are automatically wiped!"));
}


function hide_boxes() {
	$(".boxcontent").hide();
	$(".boxtitle").on('click', function() {
		$(this).parent().find(".boxcontent").toggle();
	});
}

jQuery(function() {
	var pars = get_url_parameters();
	var id = pars.id;
	
	// Not enough genomes = no need to check
	if ($("#building")) {
		// Start the status checker
		status_checker(id);
	} else {
		console.log("Not enough genomes to continue ");
	}
});

