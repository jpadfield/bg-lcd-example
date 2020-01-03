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
 	
function selectQuery ($query="", $decode=true)
	{
	$API_ENDPOINT = "https://rdf.ng-london.org.uk/rrr/sparql?format=json&query=%s";
	$url = sprintf($API_ENDPOINT, urlencode($query));
	
	// Get cURL resource
	$ch = curl_init();

	$options = array(
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING       => "",
    CURLOPT_CONNECTTIMEOUT => 120,
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_MAXREDIRS      => 10,
		);
	curl_setopt_array( $ch, $options );
	$response = curl_exec($ch); 
	if($decode) {$response = json_decode($response, true);}

	curl_close($ch);

	header('Content-type: text/html; Charset=utf-8');
	
	if(isset($response["results"]["bindings"]))
		{return($response["results"]["bindings"]);}
	else {return($response);}
	}


////////////////////////////////////////////////////////////////////////
// function group: Generic variable and page building functions
////////////////////////////////////////////////////////////////////////

// Set up general Variables some of these will need to be edited on a 
// project by project basis.
function setGlobals ()
  {
	global $spep;
	
  foreach ($GLOBALS["_POST"] as $key => $value) 
    {$GLOBALS[$key] = $value;}  

  foreach ($GLOBALS["_GET"] as $key => $value) 
    {$GLOBALS[$key] = $value;}  
  
  // Project specific values for any of these default globals need to be
  // set in a project specific index.php file
  $defaultGlobals = array (
    "ontologyUrl" => "http://".$GLOBALS["computer"]."/ontology",
    "resourceUrl" => "http://".$GLOBALS["computer"]."/resource/", 
    "cidoc" => "http://www.cidoc-crm.org/rdfs/".  
      "cidoc_crm_v5.0.2_english_label.rdfs",
    "ontologyAlias" => "rro",
    "resourceAlias" => "rri",
    "ftitle" => "The National Gallery Collection",
    "flink" => "http://cima.ng-london.org.uk/collection",
    "project" => "ng",
    "support" => "<a href=\"mailto:joseph.padfield@".
      "ng-london.org.uk\">Joseph Padfield, The National Gallery ".
      "Scientific Department</a>",
    "limit" => 500,
		"example" => "default");
		
		ob_start();
		echo <<<END
	In 2007 the <a href="http://cima.ng-london.org.uk/documentation">Raphael Research Resource</a> project began to examine how complex conservation, scientific and art historical research could be combined in a flexible digital form. Exploring the presentation of interrelated high resolution images and text, along with how the data could be stored in relation to an event driven ontology in the form of <a href="http://www.w3.org/TR/rdf-concepts/">RDF triples</a>. In addition to the <a href="http://cima.ng-london.org.uk/documentation">main user interface</a> the data stored within the system is now also accessible in the the form of <a href="http://en.wikipedia.org/wiki/Linked_Data">open linkable data</a> combined with a <a href="http://en.wikipedia.org/wiki/SPARQL">SPARQL</a> end-point at <a href="https://rdf.ng-london.org.uk/rrr/sparql?format=json">https://rdf.ng-london.org.uk/rrr/sparql</a>.<br /><br />

This example will introduce the information which is currently available within this resource and some of the web-base tools that have been developed to disseminate it.<br /><br />

This process will be based on but not necessarily limited too:
<ul>
<li>How to perform basic <a href="http://en.wikipedia.org/wiki/SPARQL">SPARQL</a> queries.</li>
<li>Using <a href="http://www.php.net/">PHP</a> to collect and format the results of basic SPARQL queries.</li>
<li>Using existing <a href="http://iipimage.sourceforge.net/">IIPImage</a> javascript libraries to present high resolution images.</li>
<li>Using PHP and HTML to combine the formatted results and images into simple web-pages.</li>
</ul>

This example is intended as a basic introduction to these particular resources and some of the techniques currently being used to exploit them.  The resources will remain publicly available for those who wish to continue to work with them. However, this system should be considered as experimental and may be subject to periods of down time. An archive of the code used to create this example presentation can be found <a href="http://rdf.ng-london.org.uk/workshops/code/interface2011_250711.tar.gz">here</a>.<br /><br />

Most recently (2019) this example was refreshed as part of the work carried out in relation to the <a href="https://ahrc.ukri.org/">AHRC</a> funded <a href="https://www.ligatus.org.uk/lcd/">Linked Conservation Data</a> project.
END;
	$defaultGlobals["first_paragraph"] = ob_get_contents();
  ob_end_clean(); // Don't send output to client";
	
	$defaultGlobals["second_paragraph"] = "";
    
  foreach (  $defaultGlobals as $key => $value) 
    {if (!array_key_exists($key, $GLOBALS)) {$GLOBALS[$key] = $value;}}
    
  // Various version of the web addresses required for the page.
  //if ($GLOBALS["sitebase"] == "/") {$GLOBALS["sitebase"] = "";}
  if (preg_match ( "/^(.+)[\/]$/", $GLOBALS["sitebase"], $check))
    {$GLOBALS["sitebase"] = $check[1];}
    
  $GLOBALS["ontUrl"] = $GLOBALS["sitebase"]."/ontology";
  $GLOBALS["pageUrl"] = $GLOBALS["sitebase"]."/page";
  $GLOBALS["exampleUrl"] = $GLOBALS["sitebase"]."";
  $GLOBALS["js"] = $GLOBALS["sitebase"]."/javascript";
  $GLOBALS["resourceUrlDisplay"] = $GLOBALS["sitebase"]."/resource";
  $GLOBALS["testUrl"] = $GLOBALS["sitebase"]."/query";
  $GLOBALS["sparqlUrl"] = $GLOBALS["sitebase"]."/sparql";
  $GLOBALS["sparqlUrl"] = $spep;
  $GLOBALS["rdfUrl"] = $GLOBALS["sitebase"]."/data";
  //$GLOBALS["rdfPage"] = $GLOBALS["rdfUrl"]."/".$GLOBALS["var"];

  if (array_key_exists("Hash", $GLOBALS)) {$ontHash = "#";}
  else {$ontHash = "";}
	
  // List of ontologies used or referenced in the database.
  $GLOBALS["onts"] = array ( 
    "rdfs"     => "http://www.w3.org/2000/01/rdf-schema#",  
    "owl"     => "http://www.w3.org/2002/07/owl#", 
    "rdf"     => "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "crm"      => $GLOBALS["cidoc"]."#",    
    $GLOBALS["ontologyAlias"] => $GLOBALS["ontologyUrl"].$ontHash ,    
    $GLOBALS["resourceAlias"] => $GLOBALS["resourceUrl"] 
    );  
    
  $GLOBALS["searchPrefix"] = "";    
  foreach ($GLOBALS["onts"] as $key => $value) 
    {$GLOBALS["searchPrefix"] .= "PREFIX ".$key.":<".$value.">\n";}      
  } 

	
function prg($exit=false, $alt=false, $noecho=false)
	{
	if ($alt === false) {$out = $GLOBALS;}
	
	//if ($alt[0] == "GLOBALS") {$out = $GLOBALS;}
	else {$out = $alt;}
	
	ob_start();
	echo "<pre class=\"wrap\">";
	if (is_object($out))
		{var_dump($out);}
	else
		{print_r ($out);}
	echo "</pre>";
	$out = ob_get_contents();
  ob_end_clean(); // Don't send output to client
  
	if (!$noecho) {echo $out;}
		
	if ($exit) {exit;}
	else {return ($out);}
	}
	
function htmlHeader ()
	{
	ob_start();
  echo <<<END
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
<title>Linked Conservation Data Example | NG &amp; Blazegraph"</title>
<link rel="icon" href="http://www.nationalgallery.org.uk/custom/ng/img/icons/favicon.ico" type="image/gif" />
<link rel="stylesheet" type="text/css" href="$GLOBALS[css]/style.css" />
<link rel="stylesheet" type="text/css" href="$GLOBALS[css]/iip.css" />
<script type="text/javascript" src="$GLOBALS[js]/mootools-core-1.3.2-full-nocompat.js"></script> 
<script type="text/javascript" src="$GLOBALS[js]/mootools-more-1.3.2.1.js"></script>  
<script type="text/javascript" src="$GLOBALS[js]/ng_js-0.1.js"></script> 
<script type="text/javascript"> 
 
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-23856010-3']);
  _gaq.push(['_trackPageview']);
 
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
 
</script> 
</head>
END;
  $html = ob_get_contents();
  ob_end_clean(); // Don't send output to client";
	
	return ($html);
	}

// Construction of basic page structure, with the page details defined 
// by $data.
function defaultPage ($data="")
  { 
	header('Content-Type: text/html; charset=utf-8');   
  ob_start();
  echo <<<END
  $GLOBALS[first_paragraph]    
  $GLOBALS[second_paragraph]
END;
  $desc = ob_get_contents();
  ob_end_clean(); // Don't send output to client";
  
  $endpoint = checkEndpoint ();
  
  if (!$endpoint)
    {    
    ob_start();
    echo <<<END
      <h2>Sorry the following SPARQL End-point is not currently available</h2>
      <h3><a href="$GLOBALS[spep]">$GLOBALS[spep]</a></h3>
      
      <p>This end-point may be down for testing/administration 
       purposes or a problem may have occured. Please contact 
       $GLOBALS[support], for further information or to report this issue.</p>
    
END;
    $data = ob_get_contents();
    ob_end_clean(); // Don't send output to client
    } 
   
	echo htmlHeader (); 
  ob_start();
  echo <<<END
<body onload="pageRefresh()">
<table width="100%">
  <tr>
    <td width="150px"><a href="http://www.nationalgallery.org.uk/"><img class="logo" src="$GLOBALS[graphics]/ng_logo.png" 
      width="150px" alt="The National Gallery"  title="The National Gallery"/></a></td>
     <td width="30px"></td>
    <td align="left"><span id="insightlogo">Linked Conservation Data Example</span></td>
    <td width="30px"></td>
    <td align="right" width="143px"><a href="https://www.blazegraph.com/"><img class="logo" 
      src="$GLOBALS[graphics]/blazegraph.png" width="143px" 
      alt="4Store" title="www.blazegraph.com"/></a></td>
  </tr>
  <tr><td colspan="5" height="5"></td></tr>
  <tr><td colspan="5">
  $desc  
  </td></tr>
  <tr><td colspan="5"><hr/></td></tr>
  <tr><td colspan="5">$data</td></tr>
  <tr><td colspan="5"><hr/></td></tr>
</table>
<table width="100%"><tbody><tr>
   <td class="snnc" align="right"><small>This site was developed by: 
  $GLOBALS[support].</small></td>
</tr></tbody></table>
</body></html>
END;
$html = ob_get_contents();
ob_end_clean(); // Don't send output to client


echo $html;
}  

////////////////////////////////////////////////////////////////////////
// function group: Specific page building functions
////////////////////////////////////////////////////////////////////////
function displayExample ($data)
  {
  if ($data["type"] == "display")
    {      
    $title = "Simple display example: ".
        "</font><font class=\"about-black\">".$data["display"];
    
    ob_start();
    
    echo <<<END
	<table class="normvc"><tr>
  	<td><font class="about">$title</font></td>
  	<td align="right"><a href="$GLOBALS[exampleUrl]"><img class="logo" 
      src="$GLOBALS[graphics]/home.png" width="32px" 
      alt="Home" title="Home"/></a></td>
	</tr></table><hr />  
END;
        
    if ($data["name"] == "painting-details-display")
      {
      $arr = selectQuery ($data["query"], true); 
      $r = $arr[0];
      $p = $r["Painting"];
			$dq = htmlspecialchars($data["query"]);
      $tb = imgUrl ($r["Thumbnail"]["value"]);
      $r["Label"] = $r["Label"]["value"];
      echo <<<END
		<table class="grey"><tr><td>
    <table id="qtable" class="qresults"><tr>
      <td width="150px">
				<img src="$tb" width="150px" alt="Thumbnail for $r[Label]" title="Thumbnail for $r[Label]"/>
			</td>
      <td><ul>
END;
      $ar = getArtist ($r["Artist"]["value"]);
      echoLabel ("Artist", $r["Artist"]["value"]);
 
      echo "<li><font class=\"red\">Artist dates:</font> ".
        $ar["birth"]["value"]." - ". $ar["death"]["value"]."</li>";
    
      echo "<li><font class=\"red\">Full title:</font>".$r["Title"]["value"]."</li>";
      echoLabel ("Date made", $r["Date"]["value"]);
					
      $ms = "";
      $tr = getInfo ($r["Medium"]["value"], "rdfs:label");
      $ms .= $tr . " on ";
      $tr = getInfo ($r["Support"]["value"], "rdfs:label");
      $ms .= $tr;
      echo "<li><font class=\"red\">Medium and support:</font> $ms</li>".
        "<li><font class=\"red\">Dimensions:</font> ".
        $r["Height"]["value"]." x ".$r["Width"]["value"]." cm</li>".
        "<li><font class=\"red\">Inventory number:</font> $r[Label]</li>";
      echoLabel ("Location in Gallery", $r["Location"]["value"]);
      echo "<li><font class=\"red\">URI:</font> <a href=\"".
        "$p[value]\">$r[Label]</a></li>".
        "<li><font class=\"red\">NG Website:</font> <a href=\"".
        "http://www.nationalgallery.org.uk/goto/painting.ashx?ID=".
        "$r[Label]\">$r[Label]</a></li>".
        "</ul></td></tr></table></td></tr></table>";
				
echo <<<END
	<br />
	<table class="grey">
		<tr><td><font class="about">Simplified PHP Code</font></td></tr>
		<tr><td style="padding: 10px;">
		<pre>
&lt;?php

require_once ("header.php");
setGlobals();

\$q = "$dq";
\$r = selectQuery (\$q, true);
\$r = \$r[0];
\$tb = imgUrl (\$r["Thumbnail"]);
\$arr = selectQuery (\$q, true); 
\$r = \$arr[0];
\$p = \$r["Painting"];
\$tb = imgUrl (\$r["Thumbnail"]["value"]);
\$r["Label"] = \$r["Label"]["value"];
END;
echo htmlspecialchars ('
echo htmlHeader (); 
echo <<<END

<table id="qtable" class="qresults"><tr>
  <td width="150px">
    <img src="$tb" width="150px" alt="Thumbnail for $r[Label]" title="Thumbnail for $r[Label]"/>
  </td>
  <td><ul>
END;
'); 

echo htmlspecialchars ('
$ar = getArtist ($r["Artist"]["value"]);
echoLabel ("Artist", $r["Artist"]["value"]);
 
echo "<li><font class=\"red\">Artist dates:</font> ".
	$ar["birth"]["value"]." - ". $ar["death"]["value"]."</li>";
    
echo "<li><font class=\"red\">Full title:</font>".$r["Title"]["value"]."</li>";
echoLabel ("Date made", $r["Date"]["value"]);
					
$ms = "";
$tr = getInfo ($r["Medium"]["value"], "rdfs:label");
$ms .= $tr . " on ";
$tr = getInfo ($r["Support"]["value"], "rdfs:label");
$ms .= $tr;
echo "<li><font class=\"red\">Medium and support:</font> $ms</li>".
	"<li><font class=\"red\">Dimensions:</font> ".
	$r["Height"]["value"]." x ".$r["Width"]["value"]." cm</li>".
	"<li><font class=\"red\">Inventory number:</font> $r[Label]</li>";
echoLabel ("Location in Gallery", $r["Location"]["value"]);
echo "<li><font class=\"red\">URI:</font> <a href=\"".
	"$r[Painting]\">$r[Label]</a></li>".
	"<li><font class=\"red\">NG Website:</font> <a href=\"".
	"http://www.nationalgallery.org.uk/goto/painting.ashx?ID=".
	"$r[Label]\">$r[Label]</a></li>".
	"</ul></td></tr></table></td></tr></table>";

?>');
		echo "</pre></td></tr></table>";
      }
    else if ($data["name"] == "image-details-display")
      {
      $arr = selectQuery ($data["query"], true); 
      $r = $arr[0];
			$dq = htmlspecialchars($data["query"]);
			$im = $r["Pyramid"]["value"];
			$w = $r["Width"]["value"];
			$h = $r["Height"]["value"];
			$l = $r["Levels"]["value"];
			$server = $r["IIPServer"]["value"];
			$ID = $r["ID"]["value"];
      echo <<<END
    <script type="text/javascript" src="$GLOBALS[js]/iipmooviewer-2.0_ng.js"></script> 
    <script language="javascript" type="text/javascript"> 
    window.addEvent('domready',function() {
      var niip = new IIP( "iipDiv", {
        image: '$im',
        prefix: 'graphics/',
        hideIcon: true,
        navigation: 'top right',
        image_vars: {
          max_width : $w,
          max_height : $h,
          tile_size : 256,
          num_resolution : $l},
        server: '$server'})
});
    </script>
		<table class="grey"><tr><td>
    <table id="qtable" class="qresults"><tr>
      <td width="640px"><div id="iipDiv" class="targetframe"></div></td>
      <td><font class="about">Simple <a href="http://iipimage.sourceforge.net">
    IIPImage</a> Viewer for:</font><ul><li><a href="$im">$ID</a></li></ul></td>
    </tr></table></td></tr></table>
END;
echo <<<END
	<br />
	<table class="grey">
		<tr><td><font class="about">Simplified PHP Code</font></td></tr>
		<tr><td style="padding: 10px;">
		<pre>
&lt;?php

require_once ("header.php");
setGlobals();

\$q = "$dq";
\$arr = selectQuery (\$q, true); 
\$r = \$arr[0];
\$im = \$r["Pyramid"]["value"];
\$w = \$r["Width"]["value"];
\$h = \$r["Height"]["value"];
\$l = \$r["Levels"]["value"];
\$server = \$r["IIPServer"]["value"];
\$ID = \$r["ID"]["value"];

END;
echo htmlspecialchars ('
echo htmlHeader ();
echo <<<END
<script type="text/javascript" src="$GLOBALS[js]/iipmooviewer-2.0_ng.js"></script> 
    <script language="javascript" type="text/javascript"> 
    window.addEvent("domready",function() {
      var niip = new IIP( "iipDiv", {
        image: "$im",
        prefix: "graphics/",
        hideIcon: true,
        navigation: "top right",
        image_vars: {
          max_width : $w,
          max_height : $h,
          tile_size : 256,
          num_resolution : $l},
        server: "$server"})
});
    </script>
		<table class="grey"><tr><td>
    <table id="qtable" class="qresults"><tr>
      <td width="640px"><div id="iipDiv" class="targetframe"></div></td>
      <td><font class="about">Simple <a href="http://iipimage.sourceforge.net">
    IIPImage</a> Viewer for:</font><ul><li><a href="$im">$ID</a></li></ul></td>
    </tr></table></td></tr></table>
END;
?>');
		echo "</pre></td></tr></table>";
      }
    else if ($data["name"] == "text-details-display")
      {
      $r = getTextDetails("rri:Hofmann_Provenance_2008_NG1171_Part_II");
      echo "<table class=\"qtext\"><tr><td><font class=\"about\">".
        lit2html($r["title"]["value"])."</font><hr /></td></tr>";
    
      foreach ($r["children"] as $key => $ar)
        {displayChildText ($ar, 0);}
      
      echo "</table>";
			  
			echo <<<END
	<br />
	<table class="grey">
		<tr><td><font class="about">Simplified PHP Code</font></td></tr>
		<tr><td style="padding: 10px;">
		<pre>
&lt;?php

require_once ("header.php");
setGlobals();
echo htmlHeader ();
END;
			echo htmlspecialchars ('

$r = getTextDetails("rri:Hofmann_Provenance_2008_NG1171_Part_II");
echo "<table class=\"qtext\"><tr><td><font class=\"about\">".
  lit2html($r["title"]["value"])."</font><hr /></td></tr>";
    
foreach ($r["children"] as $key => $ar)
  {displayChildText ($ar, 0);}
      
echo "</table>";

?>');
			echo "</pre></td></tr></table>";      
      }
    else {}
      
    
    $data = ob_get_contents();
    ob_end_clean(); // Don't send output to client
    }
  else
    {
    $t1 = "SPARQL Query";
    $t2 = "Query Results";
    $qf = queryForm ($data["query"], "./");    
    $r = selectQuery ($data["query"]);  
    $str = pre ($r);
		$dq = htmlspecialchars($data["query"]);
    
    if (!$data["display"]) 
      {$title = "Custom query example";}
    else
      {$title = ucfirst($data["type"])." query example: ".
        "</font><font class=\"about-black\">".$data["display"];}
        
    ob_start();
    echo <<<END
	<table class="normvc"><tr>
  	<td><font class="about">$title</font></td>
  	<td align="right"><a href="$GLOBALS[exampleUrl]"><img class="logo" 
      src="$GLOBALS[graphics]/home.png" width="32px" 
      alt="Home" title="Home"/></a></td>
	</tr></table><hr /> 
	<table class="grey"><tr><td>
  <table id="qtable" class="qresults"><tr>
      <td><font class="about">$t1</font></td>
      <td><font class="about">$t2</font></td>
    </tr><tr>
      <td>$qf</td>
      <td><div id="qresults" class="qresults">$str</div></td></tr>
  </table>  
	</td></tr></table>  
	<br />
	<table class="grey">
		<tr><td><font class="about">Simplified PHP Code</font></td></tr>
		<tr><td style="padding: 10px;">
		<pre>
&lt;?php

require_once ("header.php");
setGlobals();

\$q = "$dq";

\$r = selectQuery(\$q, true);

echo "&lt;pre&gt;";
print_r (\$r);
echo "&lt;/pre&gt;";

?&gt;
		</pre><br />
		</td></tr>
		</table>  
END;
    $data = ob_get_contents();
    ob_end_clean(); // Don't send output to client
    }
    
  defaultPage($data);    
  }
  
function displayChildText ($arr, $lv=0)
  {
	$pl = $lv * 20;
  
  if ($lv == 0)
    {$tc = "lv1";
     $pt = 20;}
  else if  ($lv == 1)
    {$tc = "lv2";
     $pt = 10;}
  else
    {$tc = "lv3";
     $pt = 5;}
    
  echo "<tr><td style=\"padding-left:$pl"."px; padding-top:$pt"."px;\"><font class=\"$tc\">".
        lit2html($arr["title"]["value"])."</font></td></tr>";
        
  echo "<tr><td style=\"padding-left:$pl"."px;\">";
  
  if (isset($arr["contents"]))
    {
    echo "<table class=\"qresults\"><tr>";
    foreach ($arr["contents"] as $k => $a)
      {if ($a["content"]) {echo "<td><p class=\"just\">$a[content] @".$a["content lang"]."</p></td>";}
			 else {echo "<td></td>";}}	 
    echo "</tr></table>";
    }
  
  if (isset($arr["descriptions"]))
    {
    foreach ($arr["descriptions"] as $k => $a)
      {echo "<p class=\"justc\">$a[description] @".$a["description lang"]."</p>";}
    }
  
  if ($arr["images"])
    {		
    echo "<div class=\"pageGrid\"><ul>";
    foreach ($arr["images"] as $key => $iar)
      {
      $max = 100;
      if (preg_match ( "/^(.+)(N-0000-00-0000SM-PYR.tif)(.+)$/", $iar["thumb"]["value"], $check))
        {$twd = $max."px";
         $twi = ($max-2)."px";
         $twt = "0px";
         $twl = "0px";}
      else
        {$ts = getThumbWidth ($iar["width"]["value"], $iar["height"]["value"], ($max-2));
         $twd = $max."px";
         $twi = $ts[0]."px";
         $twt = $ts[1]."px";
         $twl = $ts[2]."px";}
       
			$tb = imgUrl ($iar["thumb"]["value"]);
			$cp = $iar["caption"]["value"];
      echo <<<END
      <li>
      <div class="tt" title="$cp" 
        style="height: $twd; width: $twd;">
      <img src="$tb" alt="$cp" title="$cp" 
        style="width: $twi; margin-top: $twt; margin-left: $twl; " />
      </div>
      </li>
END;
      }
    echo "</ul></div>";
    }
  echo "</td></tr>";
  
  $lv++;
    
  foreach ($arr["children"] as $key => $ar)
    {displayChildText ($ar, $lv);}
  }

   

  
 function queryForm ($query, $action="../sparql/")
  {
  ob_start();
  echo <<<END
    <form action="$action" method="post"> 
    <textarea id="qform" name="query" style="width:95%" rows="18" cols="10">
$query
    </textarea><br /> 
    <em>Soft limit</em> <input type="text" name="soft-limit" /> 
    <input type="submit" value="Execute" /><input type="reset" /> 
    </form> 
  
END;
    $html = ob_get_contents();
    ob_end_clean(); // Don't send output to client
    
  return ($html);
  }
	
function defaultExamples ()
  {  
  $examples = array(
  "ng-paintings" => array (
  "type" => "simple",
  "name" => "ng-paintings", 
  "display" => "Find National Gallery paintings", 
  "query" => $GLOBALS["searchPrefix"]."\nSELECT * WHERE {\n".
    "\t?ngp rro:RP24.has_owner rri:The_National_Gallery;\n".
    "\trdf:type rro:RC12.Painting .\n} LIMIT 5"),
  "painting-thumbnail" => array (
  "type" => "simple",
  "name" => "painting-thumbnail", 
  "display" => "Find a painting's thumbnail", 
  "query" => $GLOBALS["searchPrefix"]."\nSELECT * WHERE {\n".
    "\trri:NG1171 rro:RP231I.has_the_display_image ?dim .\n".
    "\t?dim rro:RP259.has_thumbnail ?thumb .\n}"),
  "related-category" => array (
  "type" => "simple",
  "name" => "related-category", 
  "display" => "Find related things by category", 
  "query" => $GLOBALS["searchPrefix"]."\nSELECT * WHERE {\n".
    "\t?things rro:RP40.is_related_to rri:NG1171 ;\n".
    "\trro:RP98.is_in_project_category rri:RCL183.Provenance .\n} LIMIT 5") ,
  "x-ray-images" => array (
  "type" => "simple",
  "name" => "x-ray-images", 
  "display" => "Find x-ray images", 
  "query" => $GLOBALS["searchPrefix"]."\nSELECT * WHERE {\n".
    "\t?things rro:RP98.is_in_project_category rri:RCL211.X-Ray_Images ;\n".
    "\trdf:type rro:RC25.Image .\n} LIMIT 5") ,
  "artist-details" => array (
  "type" => "simple",
  "name" => "artist-details", 
  "display" => "Find artist details for a given painting",  
  "query" => $GLOBALS["searchPrefix"]."\nSELECT ?name ?birth ?death WHERE {\n".
    "\trri:NG1171 rro:RP72.was_produced ?production .\n".
    "\t?production rro:RP43.was_carried_out_by ?artist .\n".
    "\t?artist rro:RP17.has_identifier ?name ;\n".
    "\t\trro:RP4.died_in ?d ;\n".
    "\t\trro:RP42.was_born_in ?b .\n".  
    "\t?d rro:RP209.has_time-span ?dts .\n".
    "\t?dts rdfs:label ?death .\n".
    "\t?b rro:RP209.has_time-span ?bts .\n".
    "\t?bts rdfs:label ?birth .\n".
    "}") ,
  "painting-details" => array (
  "type" => "complex",
  "name" => "painting-details", 
  "display" => "Find main details for a given painting",  
  "query" => $GLOBALS["searchPrefix"]."\nSELECT 
  ?Painting ?Label ?Location ?Medium ?Support 
  ?Height ?Width ?Collection ?Title ?sTitle 
  ?Artist ?Date ?Thumbnail ?Curator 

WHERE { 
  ?Painting rdf:type rro:RC12.Painting; 
    rro:RP10.has_current_location ?Location; 
    rro:RP72.was_produced ?Production; 
    rdfs:label ?Label; 
    rro:RP99.is_part_of ?Collection; 
    rro:RP231I.has_the_display_image ?dim .
  Optional { ?Painting rro:RP9.has_curator  ?Curator . }.
  Optional { ?Painting rro:RP20.has_medium ?Medium . }.
  Optional { ?Painting rro:RP32.has_support ?Support . }.
  Optional { ?Painting rro:RP36.has_width_in_cm ?Width . }.
  Optional { ?Painting rro:RP16.has_height_in_cm ?Height . }.
  Optional { ?Painting rro:RP34.has_title ?Title . }.
  Optional { ?Painting rro:RP31.has_short_title ?sTitle . }.
  ?dim rro:RP259.has_thumbnail ?Thumbnail .
  ?Production rro:RP43.was_carried_out_by ?Artist;  
  Optional { ?Production rro:RP209.has_time-span ?Date . }.
  FILTER ( ?Painting = rri:NG27 ) . }") ,
  "image-details" => array (
  "type" => "complex",
  "name" => "image-details", 
  "display" => "Find main details for a given image",  
  "query" => $GLOBALS["searchPrefix"]."\nSELECT 
  ?Image ?ID ?Height ?Width 
  ?Levels ?Pyramid ?IIPServer 
  ?Caption

WHERE { 
  ?Image rro:RP17.has_identifier ?ID ;
    rro:RP225.has_width_in_pixels ?Width ;
    rro:RP227.has_height_in_pixels ?Height ;
    rro:RP243.has_pyramid_server ?Server ;
    rro:RP30.has_pyramid ?Pyramid ;
    rro:RP86.has_no_of_pyramidal_levels ?Levels ;
    rro:RP241.is_public rri:RCL228.Yes ;
    rdf:type rro:RC25.Image .
  Optional { ?Image  rro:RP233.has_caption ?Caption . }.
  ?Server rdf:type rro:RC280.IIPImage_Server ;
    rdfs:label ?IIPServer
  
  FILTER ( ?Image = rri:N-1171-00-000049-WZ-PYR ) . }") ,
  
  "text-details" => array (
  "type" => "complex",
  "name" => "text-details", 
  "display" => "Find details for a given digital text",  
  "query" => $GLOBALS["searchPrefix"]."\nSELECT 
  ?text ?id ?title ?label 
  ?im ?thumb ?caption ?child

WHERE { 
  ?text rro:RP17.has_identifier ?id ;
    rro:RP34.has_title ?title ;
    rdfs:label ?label ;
    rdf:type rro:RC220.Digital_Text .
  Optional { 
    ?text rro:RP40.is_related_to ?im .
    ?im rdf:type rro:RC25.Image ;
      rro:RP259.has_thumbnail ?thumb ;
      rro:RP233.has_caption ?caption . }.
  Optional { 
    ?child rro:RP99.is_part_of ?text ;
      rdf:type rro:RC220.Digital_Text . }.  
  FILTER ( ?text = rri:Hofmann_Provenance_2008_NG1171_Part_II ) . }") ,
  
  "text-details-2" => array (
  "type" => "complex",
  "name" => "text-details-2", 
  "display" => "Find further details for a given digital text",  
  "query" => $GLOBALS["searchPrefix"]."\nSELECT 
  ?text ?id ?title ?label ?im ?thumb ?caption 
  ?child ?child_id ?child_title ?child_label 
  ?child_im ?child_thumb ?child_caption

WHERE { 
  ?text rro:RP17.has_identifier ?id ;
    rro:RP34.has_title ?title ;
    rdfs:label ?label ;
    rdf:type rro:RC220.Digital_Text .
  Optional { 
    ?text rro:RP40.is_related_to ?im .
    ?im rdf:type rro:RC25.Image ;
      rro:RP259.has_thumbnail ?thumb ;
      rro:RP233.has_caption ?caption . }.
  Optional { 
    ?child rro:RP99.is_part_of ?text ;
      rro:RP17.has_identifier ?child_id ;
      rro:RP34.has_title ?child_title ;
      rdfs:label ?child_label ;
      rdf:type rro:RC220.Digital_Text . 
    Optional { 
      ?child rro:RP40.is_related_to ?child_im .
      ?child_im rdf:type rro:RC25.Image ;
        rro:RP259.has_thumbnail ?child_thumb ;
        rro:RP233.has_caption ?child_caption . }.
    } .  
  FILTER ( ?text = rri:Hofmann_Provenance_2008_NG1171_NG6480_Part_I_0001 ) . }") 
  );
  
  $examples["painting-details-display"] = $examples["painting-details"];
  $examples["painting-details-display"]["type"] = "display";
  $examples["painting-details-display"]["name"] = 
    "painting-details-display";   
  $examples["painting-details-display"]["ref"] = "painting-details";
  
  $examples["image-details-display"] = $examples["image-details"];
  $examples["image-details-display"]["type"] = "display";
  $examples["image-details-display"]["name"] = 
    "image-details-display";   
  $examples["image-details-display"]["ref"] = "image-details";   
  
  $examples["text-details-display"] = $examples["text-details"];
  $examples["text-details-display"]["type"] = "display";
  $examples["text-details-display"]["name"] = 
    "text-details-display";   
  $examples["text-details-display"]["ref"] = "text-details";   
  
  if (array_key_exists("query",$_POST))
    {displayExample ($_POST);}
  else if (array_key_exists($GLOBALS["example"],$examples))	
    {displayExample ($examples[$GLOBALS["example"]]);}
  else
    {    
    $sim = array();
    $com = array();
    $dis = array();
    
    foreach ($examples as $key => $a) 
      {if ($a["type"] == "simple") {$sim[] = $a;}
       else if ($a["type"] == "complex") {$com[] = $a;}
       else {$dis[] = $a;}}

    $w = "33%";
      
    ob_start();
    echo "<table class=\"qresults\"><tr>";
    echo "<td width=\"$w\"><font class=\"about\">Simple Example Queries</font><ul>";
    foreach ($sim as $key => $a) 
      {
      echo "<li><a href=\"?example=".$a["name"]."\">".
        $a["display"]."</a></li>";
      }    
    echo "</ul></td>";
    
    echo "<td width=\"$w\"><font class=\"about\">Complex Example Queries</font><ul>";
    foreach ($com as $key => $a) 
      {
      echo "<li><a href=\"?example=".$a["name"]."\">".
        $a["display"]."</a></li>";
      }    
    echo "</ul></td>";
    
    echo "<td width=\"$w\"><font class=\"about\">Display Examples</font><ul>";
    foreach ($dis as $key => $a) 
      {
      echo "<li><a href=\"?example=".$a["name"]."\">".
        $a["display"]."</a></li>";
      }    
    echo "</ul></td>";
    
    echo "</tr></table>";
    $data = ob_get_contents();
    ob_end_clean(); // Don't send output to client";
    
    defaultPage($data);
    }
  }
 
////////////////////////////////////////////////////////////////////////
/// function group: Query Functions Functions   
////////////////////////////////////////////////////////////////////////
 
function selectQueryOLD ($q)
  {
  // Setup link to 4Store database, the 4store-php Library is included 
  // in header.php
  //put argument false to write
  $readonly = true;
  $s = new Endpoint($GLOBALS["ep"],$readonly);
  $r = $s->query($q, 'rows');  
  return ($r);
  }
  
function getInfo ($uri, $what="rdfs:label")
  {
  if(preg_match ( "/^http.+$/", $uri, $check))
    {$uri = "<".$uri.">";}
  
  $q = $GLOBALS["searchPrefix"]."SELECT * WHERE { ".
    "?Subject $what ?Object . FILTER ( ?Subject = $uri ) . }";
  
  $res = selectQuery ($q, true);
  if (isset($res[0]["Object"]["value"]))
		{$obj = $res[0]["Object"]["value"];}
	else
		{$obj = false;}
		
  return ($obj);
  } 
	
function getArtist ($uri)
  {  
  if(preg_match ( "/^http.+$/", $uri, $check))
    {$uri = "<".$uri.">";}
  
  $q = $GLOBALS["searchPrefix"].
    "SELECT ?name ?birth ?death WHERE {
      ?artist rdfs:label ?name ;
        rro:RP4.died_in ?d ;
        rro:RP42.was_born_in ?b .
      ?d rro:RP209.has_time-span ?dts .
      ?dts rdfs:label ?death .
      ?b rro:RP209.has_time-span ?bts .
      ?bts rdfs:label ?birth .
  FILTER ( ?artist = $uri ) . }";

  $res = selectQuery ($q, true);
  return ($res[0]);
  }
  
function getTextDetails ($uri)
  { 
  if(preg_match ( "/^http.+$/", $uri, $check))
    {$uri = "<".$uri.">";}
  
  $q = $GLOBALS["searchPrefix"].
    "SELECT ?text ?title  
  WHERE { 
  ?text rro:RP34.has_title ?title ;
    rdfs:label ?label ;
    rdf:type rro:RC220.Digital_Text .  
  FILTER ( ?text = $uri ) . }";
  
  $qcon = $GLOBALS["searchPrefix"].
    "SELECT ?content WHERE { $uri rro:RP237.has_content ?content . }";
    
  $qdes = $GLOBALS["searchPrefix"].
    "SELECT ?description WHERE { $uri rro:RP59.has_description ?description . }";
  
  $iq = $GLOBALS["searchPrefix"].
    "SELECT ?im ?thumb ?width ?height ?caption WHERE { 
      ?text rro:RP40.is_related_to ?im .
      ?im rdf:type rro:RC25.Image ;
        rro:RP225.has_width_in_pixels ?width ;
        rro:RP227.has_height_in_pixels ?height ;
        rro:RP259.has_thumbnail ?thumb ;
        rro:RP233.has_caption ?caption .
     FILTER ( ?text = $uri ) . }";  
  
  $cq = $GLOBALS["searchPrefix"].
    "SELECT ?child ?order WHERE { 
    ?child rro:RP99.is_part_of ?text ;
      rdf:type rro:RC220.Digital_Text . 
    Optional { 
      ?child rro:RP235.has_order_code ?order .
      }.     
  FILTER ( ?text = $uri ) . }
  ORDER BY ?order";
  
  $r = selectQuery ($q);
  $ta = $r[0];
  $ta["images"] = array();
  $ta["children"] = array();
  
  $conr = selectQuery ($qcon);
  foreach ($conr as $key => $cona) {$ta["contents"][] = array(
		"content" => $cona["content"]["value"],
		"content lang" => $cona["content"]["xml:lang"]);}
       
  $desr = selectQuery ($qdes);
  foreach ($desr as $key => $desa) {$ta["descriptions"][] = array(
		"description" => $desa["description"]["value"],
		"description lang" => $desa["description"]["xml:lang"]);}
  
  $ir = selectQuery ($iq);
  foreach ($ir as $key => $ia) {$ta["images"][] = $ia;}
    
  $cr = selectQuery ($cq); 
  foreach ($cr as $key => $ca)
    {$ta["children"][] = getTextDetails ($ca["child"]["value"]);} 
  
  return ($ta);
  }
	
function checkEndpoint ()
  {$q= "SELECT ?s WHERE { ?s ?p ?o . } LIMIT 1";
   if (selectQuery ($q)) {return (true);}
   else {return(1);}}
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
/// function group: Simple Formatting Functions
////////////////////////////////////////////////////////////////////////
function getThumbWidth ($width, $height, $max=150)
  {
  $ofv = 0;
  $ofh = 0;
  
  if ($height == $width)
    {$tw = $max;
     $th = $max;}
  else if ($height > $width)
    {$tw = ($max/$height) * $width;
     $th = $max;
     $ofh = ($max - $tw)/2;}
  else
    {$tw = $max;
     $th = ($max/$width) * $height;
     $ofv = ($max - $th)/2;}
    
  return (array($tw, $ofv, $ofh, $th, $width, $height, $max));
  }
  
function echoLabel ($l, $u, $c="red")
  {$r = getInfo ($u, "rdfs:label");  
   echo "<li><font class=\"$c\">$l:</font> ".
    $r."</li>";}
		
function pre ($arr)
  {ob_start();
   echo "<pre>";
   print_r ($arr);
   echo "</pre>";
   $str = ob_get_contents();
   ob_end_clean(); // Don't send output to client
   return ($str);}
  
 function lit2html ($str)
  {$str = preg_replace ("/\"\"\"/", "", $str);
   $str = preg_replace ("/[\n\r]/", "<br/>", $str);
   return ($str);}
	  
function imgUrl ($str)
  {return (preg_replace ("/&/", "&amp;", $str));}
////////////////////////////////////////////////////////////////////////
?>
