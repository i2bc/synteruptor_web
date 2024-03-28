<?php if(!isset($_SESSION)){session_start();} ?>
<?php if(!isset($_SESSION["db_ids"])){$_SESSION["db_ids"]=array();} ?>
<?php if(!isset($_SESSION["blast_ids"])){$_SESSION["blast_ids"]=array();} ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<?php
		require_once("common.php");
		require_once("lib_db.php");
        ?>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title><?php site_name(); ?> database exploration</title>
		<link rel="icon" type="image/png" href="css/Synteruptor_logo_square.png">
		<link rel="stylesheet" type="text/css" href="css/common.css">
		<script type="text/javascript" src="js/jquery/jquery-1.12.min.js"></script>
		<script type="text/javascript" src="js/common.js"></script>
		<script type="text/javascript" src="js/index.js"></script>

	</head>
	
	<nav>
		<?php
			print_sidebar();
		?>		
	</nav>
	<body>
		<?php
			print_header();
		?>

		<div id="content">
			<div class="centered_box">
				<h2>Available databases</h2>
                <div class='index_box'>
                <?php
                    // Display public databases (if any)
                    $allowed = get_available_dbs_list("dbs");
                    if ($allowed) {
                        echo "<p>The following databases were generated with preselected genomes and can be freely explored (they might take a few seconds to load):</p>";
                        echo "<div id='databases'></div>";
                    } else {
                        echo "<p>No public database available</p>";
                    }
                ?>
				<br>
                </div>
			</div>
			<div class="centered_box">
				<h2>User databases</h2>
                <div class='index_box'>
                <?php

					// Check what user DBs are still available and list only those
					$available_dbs = get_available_dbs_list("user", $_SESSION['db_ids']);
					foreach ($_SESSION['db_ids'] as $key => $value){
						if(!in_array($value.".sqlite",$available_dbs)){
							console_log("removing".$value);
							unset($_SESSION['db_ids'][$key]);
						}
					}
					if (empty($available_dbs)){
						echo "<p>No user databases found in web browser cache (/!\ note that jobs older than 30 days are automatically wiped)...</p>";
					}else{
						echo "<p>The following databases were found in your web cache:</p>";
                        echo "<div id='userdatabases'></div>";
						echo "<p>/!\ note that jobs older than 30 days are automatically wiped.</p>";

						// foreach ($_SESSION['db_ids'] as &$value){
						// 	$site_host = get_setting('site_host');
						// 	$site_host_subdir = get_setting('site_host_subdir');
						// 	echo "<p><a href='$site_host/$site_host_subdir/summary.php?version=$value'>$value</a></p>";
						// }
					}
                ?>
                </div>
			</div>
			<div class="centered_box">
				<h2>User searches</h2>
                <div class='index_box'>
                <?php

					// // Check what user DBs are still available and list only those
					// $available_dbs = get_available_dbs_list("user", $_SESSION['db_ids']);
					// foreach ($_SESSION['blast_ids'] as $key => $value){
					// 	if(!in_array($value.".sqlite",$available_dbs)){
					// 		console_log("removing".$value);
					// 		unset($_SESSION['db_ids'][$key]);
					// 	}
					// }
					if (empty($_SESSION['blast_ids'])){
						echo "<p>No user searches found in web browser cache (/!\ note that jobs older than 30 days are automatically wiped)...</p>";
					}else{
						echo "<p>The following user searches were found in your web cache:</p>";
						
						foreach ($_SESSION['blast_ids'] as &$value){
							$site_host = get_setting('site_host');
							$site_host_subdir = get_setting('site_host_subdir');
							echo "<p><a href='$site_host/$site_host_subdir/search.php?id=$value'>$value</a></p>";
						}
						echo "<p>/!\ note that jobs older than 30 days are automatically wiped.</p>";
					}
                ?>
                </div>
			</div>

		</div>
	</body>
</html>

