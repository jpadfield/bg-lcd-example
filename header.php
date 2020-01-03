<?php

/**
 * @copyright (c) 2019 The National Gallery, London
 * @author Joseph Padfield <joseph.padfield@ng-london.org.uk>

 Copyright (c) 2019 The National Gallery, London

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// J Padfield
$last_updated = "25/07/2011";

### Set Paths #####################################################

if (preg_match ( "/(.+)[\/]$/", $_SERVER["REQUEST_URI"], $var_c))
	{$site = $var_c[1];}
elseif (preg_match ( "/(.+)[\/]css[\/].+$/", $_SERVER["REQUEST_URI"], $var_c))
	{$site = $var_c[1];}
else
	{$site = dirname($_SERVER["PHP_SELF"]);}

$base = preg_replace ("/[\/]$/", "", $_SERVER["DOCUMENT_ROOT"]);

$computer = $_SERVER["HTTP_HOST"];
$sitebase = "https://$computer$site";
$thisbase = "$base$site";
$functions = $thisbase."/functions";
$include_path = get_include_path();
set_include_path("$include_path:$thisbase:$functions");
$this_page = substr($_SERVER['PHP_SELF'], strrpos($_SERVER['PHP_SELF'], "/") + 1);

$css = $sitebase."/css";
$graphics = $sitebase."/graphics";

### Basic 4store-php #################

### Additional NG Functions ########################################
include ("ng_functions.php");

##Default port settings, these may need to be reset for specific projects
$ep = "https://rdf.ng-london.org.uk/bg/";
$spep = "https://rdf.ng-london.org.uk/bg/bigdata/sparql";

//If the resource and ontology URLs in the triple store do not match 
//the presenting computer these values need to be reset
$ontologyUrl = "https://rdf.ng-london.org.uk/raphael/ontology/";
$resourceUrl = "https://rdf.ng-london.org.uk/raphael/resource/";
?>
