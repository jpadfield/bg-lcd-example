/*
  Copyright (c) 2011 Joseph Padfield <joseph.padfield@ng-london.org.uk>

  Built using the Mootools 1.3.2 javascript framework <http://www.mootools.net>

  ---------------------------------------------------------------------------

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

  ---------------------------------------------------------------------------
*/

// General styling and positioning for your page
function pageRefresh (pageWidth) {	
	var pg = getWH (pageWidth);
	var sb = 0;
	
////////////////////////////////////////////////////////////////////////	  
// General page setup adjust as required
	
	//body padding equal 20px left and right
	var hw = (pg.pw/2) - 40;
	if ($('qresults'))
		{$('qresults').setStyles({
			width: hw + 'px',
			top: 2 + 'px'
			});
		 $('qform').setStyles({width: hw + 'px'});}
		
	if ($('iipDiv'))
		{
		//var cw = $('iipDiv').getStyle('width').toInt();
		//$('iipDiv').setStyles({left: (pg.pw - cw)/2 - 20 + 'px'});
		}
	}

function getWH (pageWidth)
	{
	var vs = new Object;  
	
  var winD = Window.getSize();
	var acw = winD.x;
	vs.w = winD.x;
	vs.h = winD.y;
	
	if (vs.h < 800)
	  {vs.h = 800;}
		
	if (vs.w < 1024)
	  {vs.w = 1024;}	
	else if (vs.w > 1920)
	  {vs.w = 1920;}
	
	if (pageWidth)
		{vs.pw = pageWidth;}	
	else
		{vs.pw = vs.w;}
		
	if (vs.pw < acw)
		{vs.lo = (acw - vs.pw)/2;}
	else {vs.lo = 0;}
		
	vs.ro = (vs.pw - 35 + vs.lo);
	
	return (vs);
	}
	
function getElementsByClassName(strClassName, strTagName, oElm) 
	{
  var arrElements = (strTagName == "*" && document.all) ? 
		document.all : oElm.getElementsByTagName(strTagName);

  var arrReturnElements = new Array();
  
	strClassName = strClassName.replace(/\-/g, "\\-");
  
	var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
  var oElement;
  
	for(var i=0; i<arrElements.length; i++){
  	oElement = arrElements[i];      
    if(oRegExp.test(oElement.className)) {
    	arrReturnElements.push(oElement);}}

	return (arrReturnElements)
	} 
