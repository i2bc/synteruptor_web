function fasta( gene, sep ) {
	var product = (gene.product && gene.product != "") ? ' "' + gene.product + '"' : "";
	return '>' + gene.pid + product + sep + gene.sequence + sep;
}

function html_fasta( gene ) {
	return fastaline = fasta( gene, "<br>");
}

function get_fasta( gene ) {
	return fasta( gene, "\n");
}

function html_fasta_list( genes ) {
	var list = [];
	for ( var g in genes ) {
		var gene = genes[ g ];
		list.push( html_fasta( gene ) );
	}
	return list.join("<br />");
}

function blast_ncbi_redirect( gene ) {
	var url_origin = "http://www.ncbi.nlm.nih.gov/blast/Blast.cgi";
	var commands = {
		'COMMAND': "Put",
		'PAGE_TYPE': "BlastSearch",
		'PROGRAM': gene.feat == 'CDS' ? "blastp" : "blastn",
		'DATABASE': gene.feat == 'CDS' ? "nr" : "nt",
		'QUERY': encodeURIComponent( get_fasta( gene ) )
	};
	var final_url = format_url( url_origin, commands );
	window.location.replace( final_url );
}

function blast_db_redirect( gene, db ) {
	var data = {
		'db': db,
		'seq': encodeURIComponent( get_fasta( gene ) )
	};
	$.post( urls.start_search, data, function(d) {
		if (d.status == 'success' && d.id && urls.search) {
			var pars = { 'id': d.id };
			var final_url = format_url( urls.search, pars );
			setTimeout(function() {
				window.location = final_url;
			}, 1000);
		} else {
			console.log( "Error" );
		}
	}, "json")
	.fail(function(d) {
		console.log(d);
	});
	//window.location.replace( final_url );
}

jQuery(function() {
	// Retrieve the data
	var pars = get_url_parameters();
	
	if (pars.pid) {
		pars.type = 'gene';
	} else if (pars.breakid && pars.sp) {
		pars.type = 'break_genes';
	} else {
		console.log("Error: no type");
		return;
	}
	$.getJSON( urls.get_data, pars, function( gene ) {
		$('#waiting').hide();
		if ( gene.outcome === false ) {
			console.log( "Error" );
			console.log( gene );
			$error = $('<span />').text( 'Error: ' + gene.message ).attr( 'title', gene.details );
			$('#message').append($error);
			$('#message').show();
		} else {
			if (pars.blast) {
				if ( pars.blast == 'ncbi') {
					blast_ncbi_redirect( gene );
				} else if ( pars.blast == 'db' ) {
					blast_db_redirect( gene, pars.version );
				}
			} else if (pars.breakid) {
				var fasta_list = html_fasta_list( gene.break_genes );
				$("#fasta").html(fasta_list);
       			} else if (pars.pid) {
				fastaline = html_fasta( gene );
				$('#fasta').html(fastaline);
			}
		}
	}).fail(function() {
		console.log("Query failed");
	});
});

