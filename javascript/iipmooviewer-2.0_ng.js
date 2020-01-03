/*
  IIPImage Javascript Viewer <http://iipimage.sourceforge.net>
                      Version 2.0_ng

  Copyright (c) 2007-2011 Ruven Pillay <ruven@users.sourceforge.net>
	
	This specific set of scripts has been edited in relation to the original
	and does not represent an official release.
	
	Additions Copyright (c) 2011 Joseph Padfield <joseph.padfield@ng-london.org.uk>

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


  Example:

   iip = new IIP( 'div_id', { server: '/fcgi-bin/iipsrv.fcgi',
                              image: '/images/test.tif',
                              credit: 'copyright me 2010',
			      prefix: '/prefix/',
                              zoom: 2,
			      render: 'random',
                              showNavButtons: whether to show navigation buttons: true (default) or false
			      scale: 100 } );

   where the arguments are:
	i) The id of the main div element in which to create the viewer window
	ii) A hash containting:
	      image: the full image path (or array of paths) on the server (required)
              server: the iipsrv server full URL (defaults to "/fcgi-bin/iipsrv.fcgi")
	      credit: image copyright or information (optional)
	      prefix: path prefix if images or javascript subdirectory moved (default 'images/')
              zoom: the initial zoom level (optional - defaults to 1)
              render: tile rendering style - 'spiral' for a spiral from the centre or
                      'random' for a rendering of tiles in a random order
	      scale: pixels per mm
              navigation: the location of the navigation window - either top left, top right,
	                  bottom left or bottom right

   Note: The new class instance must be assigned to the global variable "iip" in this version.
       : Requires mootools version 1.2.4 <http://www.mootools.net>
       : The page MUST have a standard-compliant XHTML declaration at the beginning

*/




/* IIP Javascript Class
 */
var IIP = new Class({


   version: '2.0',


   /* Initialize some variables. The constructor takes 4 arguments:
	i) The id of the main div element in which to create the viewer window
	ii) A hash containting:
	      image: the full image path (or array of paths) on the server (required)
              server: the iipsrv server full URL (defaults to "/fcgi-bin/iipsrv.fcgi")
	      credit: image copyright or information (optional)
              zoom: the initial zoom level (optional - defaults to 1)
              render: tile rendering style - 'spiral' for a spiral from the centre or
                      'random' for a rendering of tiles in a random order (default)
              showNavButtons: whether to show navigation buttons: true (default) or false 
	      scale: pixels per mm
   */
  initialize: function( main_id, options ) {

    this.source = main_id || alert( 'No element ID given to IIP constructor' );

    this.server = options.server || '/fcgi-bin/iipsrv.fcgi';

    this.render = options.render || 'spiral';

    this.images = new Array(options['image'].length);
    options.image || alert( 'Image location not set in IIP constructor options');
    if( typeOf(options.image) == 'array' ){
	for( i=0; i<options.image.length;i++ ){
	    this.images[i] = { src:options.image[i], sds:"0,90" };
	}
    }
    else this.images = [{ src:options.image, sds:"0,90"} ];


    this.credit = options.credit || null;

    this.scale = options.scale || null;//9448.409;

    // Set the position of the navigation window
    this.navigation = options.navigation || null;
    if( this.navigation!='none' && this.navigation!='top left' && this.navigation!='top right' && 
	this.navigation!='bottom left' && this.navigation!='bottom right' ){
	this.navigation = 'top right';
    }
    if( Browser.Platform.ios | Browser.Platform.android ) this.navigation = 'none';

    if( options.zoom == 0 ) this.initialZoom = 0;
    else this.initialZoom = options.zoom || null;
		
		//NG CHANGE Allow user to set a start point
    if( options.startX == 0 ) this.initialX = 0;
    else this.initialX = options.startX || null;		
    if( options.startY == 0 ) this.initialY = 0;
    else this.initialY = options.startY || null;
		

    this.showNavWindow = true;
    if( options.showNavWindow == false ) this.showNavWindow = false;

    this.showNavButtons = true;
    if( options.showNavButtons == false ) this.showNavButtons = false;

    this.navWinSize = options.navWinSize || 0.2;

    this.winResize = true;
    if( options.winResize==false ) this.winResize = false;

    this.prefix = options.prefix || 'images/';

    // Preload tiles surrounding view window?
    this.preload = false;
    this.effects = false;

    // Annotations
    this.annotations = options.annotations || null;
    this.annotationTip = null;

    // Disable the right click context menu on image tiles?
    this.disableContextMenu = true;

    this.boot = options.boot || null;
    if( this.boot ){
      this.size = options.boot['max-size'];
      this.res = options.boot['number-resolutions'];
    }

    // If we want to assign a function for a click within the image
    // - used for multispectral curve visualization, for example
    this.targetclick = options.targetclick || null;

    this.max_size = {};      // Dimensions of largest resolution
    this.navWin = {w:0,h:0}  // Dimensions of navigation window
    this.sds = "0,90";
    this.contrast = 1.0;
    this.opacity = 0;
    this.wid = 0;             // Width of current resolution
    this.hei = 0;             // Height of current resolution
    this.resolutions;         // List of available resolutions
    this.num_resolutions = 0; // Number of available resolutions
    this.res;                 // Current resolution
    this.view = { x: 0,       // Location and dimensions of current visible view
		  y: 0,
		  w: this.wid,
		  h: this.hei };

    this.navpos = {};         // Location of navigation drag zone
    this.tileSize = {};       // Tile size in pixels {w,h}


    // Number of tiles loaded
    this.tiles = new Array(); // List of tiles currently displayed
    this.nTilesLoaded = 0;
    this.nTilesToLoad = 0;
    this.locked = false;
    this.orientation = 0;
    this.targetsize;
    this.fullscreen = false;
		
		//NG CHANGE This variable is used when calling images details via  
		//server side script rather than directly from the an image.
		this.ajax_which = options['ajax_which'] || null;
		this.ajax_extra = options['ajax_extra'] || null;
		
		//NG CHANGE Use to supply image dimensions directly avoids the need 
		//for ajax completely
		this.image_vars = options['image_vars'] || null;
		
		//NG CHANGE This variable is used if the viewer is called as part 
		//of a nested class structure, it is only used for external 
		//extensions to this class but avoids the requirement to  copy and 
		//paste this initialize function 
		this.parent =  options['parent'] || null;
		
		//NG CHANGE Allow the icon to be hidden
		this.hideIcon = options['hideIcon'] || null;

    //this.navigation = new Navigation();

    /* Load us up when the DOM is fully loaded! 
     */
    window.addEvent( 'domready', function(){ this.load() }.bind(this) );
  },



  /* Create the appropriate CGI strings and change the image sources
   */
  requestImages: function() {

    // Set our cursor
    this.canvas.setStyle( 'cursor', 'wait' );

    // Delete our annotations
    if( this.annotationTip ) this.annotationTip.detach( this.canvas.getChildren('div.annotation') );
    this.canvas.getChildren('div.annotation').each(function(el){
	el.eliminate('tip:text');
	el.destroy();
    });

    // Load our image mosaic
    this.loadGrid();

    // Create new annotations
    this.createAnnotations();
    if( this.annotationTip ) this.annotationTip.attach( this.canvas.getChildren('div.annotation') );

    // Update our navigation window zone
//    this.positionZone();
  },



  /* Create a grid of tiles with the appropriate JTL request and positioning
   */
  loadGrid: function(){
			 
    if( this.locked ) return;
    this.locked = true;
		
    var border = this.preload ? 1 : 0

    // Get the start points for our tiles
    var startx = Math.floor( this.view.x / this.tileSize.w ) - border;
    var starty = Math.floor( this.view.y / this.tileSize.h ) - border;
    if( startx<0 ) startx = 0;
    if( starty<0 ) starty = 0;


    // If our size is smaller than the display window, only get these tiles!
    var len = this.view.w;
    if( this.wid < this.view.w ) len = this.wid;
    var endx =  Math.ceil( ((len + this.view.x)/this.tileSize.w) - 1 ) + border;


    len = this.view.h;
    if( this.hei < this.view.h ) len = this.hei;
    var endy = Math.ceil( ( (len + this.view.y)/this.tileSize.h) - 1 ) + border;


    // Number of tiles is dependent on view width and height
    var xtiles = Math.ceil(this.wid / this.tileSize.h);
    var ytiles = Math.ceil(this.hei / this.tileSize.h);

    if( endx >= xtiles ) endx = xtiles-1;
    if( endy >= ytiles ) endy = ytiles-1;


    /* Calculate the offset from the tile top left that we want to display.
       Also Center the image if our viewable image is smaller than the window
    */
    var xoffset = Math.floor(this.view.x % this.tileSize.w);
    if( this.wid < this.view.w ) xoffset -=  (this.view.w - this.wid)/2;

    var yoffset = Math.floor(this.view.y % this.tileSize.h);
    if( this.hei < this.view.h ) yoffset -= (this.view.h - this.hei)/2;

    var tile;
    var i, j, k, n;
    var left, top;
    k = 0;
    n = 0;

    var centerx = startx + Math.round((endx-startx)/2);
    var centery = starty + Math.round((endy-starty)/2);

    var map = new Array((endx-startx)*(endx-startx));
    var newTiles = new Array((endx-startx)*(endx-startx));
    newTiles.empty();

    // Should put this into
    var ntiles = 0;
    for( j=starty; j<=endy; j++ ){
      for (i=startx;i<=endx; i++) {

	map[ntiles] = {};
	if( this.render == 'spiral' ){
	  // Calculate the distance from the centre of the image
	  map[ntiles].n = Math.abs(centery-j)* Math.abs(centery-j) + Math.abs(centerx-i)*Math.abs(centerx-i);
	}
	// Otherwise do a random rendering
	else map[ntiles].n = Math.random();

	map[ntiles].x = i;
	map[ntiles].y = j;
	ntiles++;

	k = i + (j*xtiles);
	newTiles.push(k);

      }
    }

    this.nTilesLoaded = 0;
    this.nTilesToLoad = ntiles*this.images.length;

    // Delete the tiles from our old image mosaic which are not in our new list of tiles
    this.canvas.getChildren('img').each( function(el){
	var index = parseInt(el.retrieve('tile'));
	if( !newTiles.contains(index) ){
          el.destroy();
	  this.tiles.erase(index);
        }
    }.bind(this) );

    map.sort(function s(a,b){return a.n - b.n;});

    for( var m=0; m<ntiles; m++ ){

      var i = map[m].x;
      var j = map[m].y;

      // Sequential index of the tile in the tif image
      k = i + (j*xtiles);

      if( this.tiles.contains(k) ){
	this.nTilesLoaded++;
        if( this.showNavWindow ) this.refreshLoadBar(); 
	continue;
      }

      // Iterate over the number of layers we have
      var n;
      for(n=0;n<this.images.length;n++){

        tile = new Element('img', {
          'class': 'layer'+n,
          'styles': {
	       opacity: this.effects ? 0.1:1,
	       left: i*this.tileSize.w,
	       top: j*this.tileSize.h
          }
        });

	// Inject into our canvas
        tile.inject(this.canvas);

        var src = this.server+"?FIF="+this.images[n].src+"&cnt="+this.contrast+"&sds="+this.images[n].sds+"&jtl="+this.res+"," + k;

	// Add our tile event functions after injection otherwise we get no event
	tile.addEvents({
	    'load': function(tiles){
	      var tile = tiles[0];
	      var id = tiles[1];
	      if( this.effects ) tile.fade('in');
//			tile.inject(this.canvas);
	      if(!(tile.width&&tile.height)){
		tile.fireEvent('error');
		return;
	      }
	      this.nTilesLoaded++;
	      if( this.showNavWindow ) this.refreshLoadBar();
	      this.tiles.push(id); // Add to our list of loaded tiles
	    }.bind(this,[tile,k]),
	    'error': function(src){
	      // Try to reload if we have an error.
	      // This seems to affect Firefox only, probably due to HTTP pipelining.
	      // Add a suffix to prevent cacheing, but only reload once to avoid endless loops
	      if( parseInt(this.retrieve('error')) > 0 ) return;
	      var src = this.src;
	      this.set( 'src', src + '?'+ Date.now() );
	      this.store('error',"1");
	    }
	});

	// We must set the source at the end so that the 'load' function is properly fired
	tile.set( 'src', src );
	tile.store('tile',k);
      }

    }

    if( this.images.length > 1 ){
      var selector = 'img.layer'+(n-1);
      this.canvas.getChildren(selector).set( 'opacity', this.opacity );
    }

    this.locked = false;

  },


  getTileURL: function(server,image,resolution,x,y){
	return server+"?FIF="+image+"&jtl="+resolution+"," + k;	
  },


  /* Allow us to navigate within the image via the keyboard arrow buttons
   */
  key: function(e){

    var d = Math.round(this.view.w/4);

    switch( e.code ){
    case 37: // left
      this.nudge(-d,0);
      break;
    case 38: // up
      this.nudge(0,-d);
      break;
    case 39: // right
      this.nudge(d,0);
      break;
    case 40: // down
      this.nudge(0,d);
      break;
    case 107: // plus
      if(!e.control) this.zoomIn();
      break;
    case 109: // minus
      if(!e.control) this.zoomOut();
      break;
    case 189: // minus
      if(!e.control) this.zoomOut();
      break;
    case 72: // h
      // For removing the navigation window if it exists - must use the get('reveal')
      // otherwise we do not have the Mootools extended object
      if( document.id(this.source).getElement('div.navcontainer') ){
	document.id(this.source).getElement('div.navcontainer').get('reveal').toggle();
 	this.canvas.getElements('div.annotation').get('reveal').each( function(el){ el.toggle() });
      }
      break;
    case 82: // r
      // For rotation in Firefox 3.5+, Chrome, Safari
      if(e.shift) this.orientation -= 45;
      else this.orientation += 45;
      var pos = this.canvas.getPosition();
      var str = (this.view.x + this.view.w/2) +"px " + (this.view.y + this.view.h/2) + "px";
      if( Browser.firefox ) this.canvas.setStyle('-moz-transform-origin', str )
      else if( Browser.chrome ) this.canvas.setStyle('-webkit-transform-origin', str )
      this.canvas.rotate(this.orientation);
      break;
    case 65: // a
      this.highlightAnnotations();
      break;
    case 27: // esc
      document.id(this.source).getElement('div.info').fade(0);
      break;
    case 70: // f fullscreen
      var l,t,w,h;
      if( !this.fullscreen ){
	this.targetsize = {
	  pos: document.id(this.source).getPosition(),
	  size: document.id(this.source).getSize()
	};
	l = 0;
	t = 0;
	w = '100%';
	h = '100%';
      }
      else{
	l = this.targetsize.pos.x;
	t = this.targetsize.pos.y;
	w = this.targetsize.size.x;
	h = this.targetsize.size.y;
      }
      document.id(this.source).setStyles({
	left: l,
	top: t,
	width: w,
	height: h
      });
      this.fullscreen = !this.fullscreen;
      this.reload();
      break;
    }
  },



  /* Scroll resulting from a drag of the navigation window
   */
  scrollNavigation: function( e ) {

    var xmove = 0;
    var ymove = 0;

    var zone_size = this.zone.getSize();
    var zone_w = zone_size.x;
    var zone_h = zone_size.y;

    // From a mouse click
    if( e.event ){
      e.stop();
      var pos = this.zone.getParent().getPosition();
      xmove = e.event.clientX - pos.x - zone_w/2;
      ymove = e.event.clientY - pos.y - zone_h/2;
    }
    else{
      // From a drag
      xmove = e.offsetLeft;
      ymove = e.offsetTop-10;
      if( (Math.abs(xmove-this.navpos.x) < 3) && (Math.abs(ymove-this.navpos.y) < 3) ) return;
    }

    if( xmove > (this.navWin.w - zone_w) ) xmove = this.navWin.w - zone_w;
    if( ymove > (this.navWin.h - zone_h) ) ymove = this.navWin.h - zone_h;
    if( xmove < 0 ) xmove = 0;
    if( ymove < 0 ) ymove = 0;

    xmove = Math.round(xmove * this.wid / this.navWin.w);
    ymove = Math.round(ymove * this.hei / this.navWin.h);

    // Only morph transition if we have moved a short distance
    var morphable = Math.abs(xmove-this.view.x)<this.view.w/2 && Math.abs(ymove-this.view.y)<this.view.h/2;
    if( morphable ){
      this.canvas.morph({
	left: (this.wid>this.view.w)? -xmove : Math.round((this.view.w-this.wid)/2),
	top: (this.hei>this.view.h)? -ymove : Math.round((this.view.h-this.hei)/2)
      });
    }
    else{
      this.canvas.setStyles({
	left: (this.wid>this.view.w)? -xmove : Math.round((this.view.w-this.wid)/2),
	top: (this.hei>this.view.h)? -ymove : Math.round((this.view.h-this.hei)/2)
      });
    }

    this.view.x = xmove;
    this.view.y = ymove;
 
    // The morph event automatically calls requestImages
    if( !morphable ){
      this.requestImages();
    }

    // Position the zone after a click, but not for zone drags
    if( e.event ) this.positionZone();
  },



  /* Scroll from a drag event on the tile canvas
   */
  scroll: function(e) {
    var pos = this.canvas.getPosition(this.source);
    var xmove =  -pos.x;
    var ymove =  -pos.y;
    this.scrollTo( xmove, ymove );
  },



  /* Check our scroll bounds. 
   */
  checkBounds: function( dx, dy ) {

    if( dx > this.wid-this.view.w ) dx = this.wid - this.view.w;
    if( dy > this.hei-this.view.h ) dy = this.hei - this.view.h;

    if( dx < 0 || this.wid < this.view.w ) dx = 0;
    if( dy < 0 || this.hei < this.view.h ) dy = 0;

    this.view.x = dx;
    this.view.y = dy;
  },



  /* Scroll to a particular position
   */
  scrollTo: function( dx, dy ) {
    if( dx || dy ){
      // To avoid unnecessary redrawing ...
      if( (Math.abs(dx) < 3) && (Math.abs(dy) < 3) ) return;
      this.checkBounds(dx,dy);
      this.requestImages();
      this.positionZone();
    }
  },



  /* Nudge the view by a small amount
   */
  nudge: function( dx, dy ){
     this.checkBounds(this.view.x+dx,this.view.y+dy);
     // Check whether image size is less than viewport
     this.canvas.morph({
       left: (this.wid>this.view.w)? -this.view.x : Math.round((this.view.w-this.wid)/2),
       top: (this.hei>this.view.h)? -this.view.y : Math.round((this.view.h-this.hei)/2)
     });
  },



  /* Generic zoom function for mouse wheel or click events
   */
  zoom: function( e ) {

    var event = new Event(e);

    // Stop all mousewheel events in order to prevent stray scrolling events
    event.stop();

    // Set z to +1 if zooming in and -1 if zooming out
    var z = 1;

    // For mouse scrolls
    if( event.wheel && event.wheel < 0 ) z = -1;
    // For double clicks
    else if( event.shift ) z = -1;
    else z = 1;


    var ct = event.target;
    if( ct ){
      var cc = ct.get('class');
      var xmove, ymove;

      if( cc != "zone" & cc != 'navimage' ){
	var pos = this.canvas.getPosition();

	// Center our zooming on the mouse position when over the main target window
	// - use clientX/Y because pageX/Y does not exist in IE
	this.view.x = event.event.clientX - pos.x - (this.view.w/2);
	this.view.y = event.event.clientY - pos.y - (this.view.h/2);
      }
      else{
	// For zooms with the mouse over the navigation window
	var pos = this.zone.getParent().getPosition();
	var n_size = this.zone.getParent().getSize();
	var z_size = this.zone.getSize();
	this.view.x = (event.event.clientX - pos.x - z_size.x/2) * this.wid/n_size.x;
	this.view.y = (event.event.clientY - pos.y - z_size.y/2) * this.hei/n_size.y;
      }
    }

    // Now do our actual zoom
    if( z == -1 ) this.zoomOut();
    else this.zoomIn();

  },


  /* Zoom in by a factor of 2
   */
  zoomIn: function(){

    if( this.res < this.num_resolutions-1 ){

      this.res++;

      // Get the image size for this resolution
      this.wid = this.resolutions[this.res].w;
      this.hei = this.resolutions[this.res].h;

      var xoffset = (this.resolutions[this.res-1].w > this.view.w) ? this.view.w : this.resolutions[this.res-1].w;
      this.view.x = Math.round( 2*(this.view.x + xoffset/4) );
      if( this.view.x > (this.wid-this.view.w) ) this.view.x = this.wid - this.view.w;
      if( this.view.x < 0 ) this.view.x = 0;

      this.view.y = Math.round( 2*(this.view.y + this.view.h/4) );
      if( this.view.y > (this.hei-this.view.h) ) this.view.y = this.hei - this.view.h;
      if( this.view.y < 0 ) this.view.y = 0;

      this.canvas.setStyles({
	 left: (this.wid>this.view.w)? -this.view.x : Math.round((this.view.w-this.wid)/2),
	 top: (this.hei>this.view.h)? -this.view.y : Math.round((this.view.h-this.hei)/2),
	 width: this.wid,
	 height: this.hei
      });

      if( this.wid < this.view.w || this.hei < this.view.h ) this.reCenter();

      this.canvas.getChildren('img').destroy();
      this.tiles.empty();

      this.requestImages();
      this.positionZone();
      if( this.scale ) this.updateScale();
      this.touch.limit = {x: this.view.w - this.wid, y: this.view.h - this.hei};
      this.touch.disableX = (this.wid < this.view.w)? true : false;
      this.touch.disableY = (this.hei < this.view.h)? true : false;
    }
  },



  /* Zoom out by a factor of 2
   */
  zoomOut: function(){

    if( this.res > 0 ){

      this.res--;

      // Get the image size for this resolution
      this.wid = this.resolutions[this.res].w;
      this.hei = this.resolutions[this.res].h;

      this.view.x = this.view.x/2 - (this.view.w/4);
      if( this.view.x + this.view.w > this.wid ) this.view.x = this.wid - this.view.w;

      this.view.y = this.view.y/2 - (this.view.h/4);
      if( this.view.y + this.view.h > this.hei ) this.view.y = this.hei - this.view.h;

      var xoffset = (this.wid > this.view.w ) ? this.view.x : (this.wid-this.view.w)/2;
      var yoffset = (this.hei > this.view.h ) ? this.view.y : (this.hei-this.view.h)/2;

      if( this.view.x < 0 ) this.view.x = 0;
      if( this.view.y < 0 ) this.view.y = 0;

      this.canvas.setStyles({
	 left: -xoffset,
	 top: -yoffset,
	 width: this.wid,
	 height: this.hei
      });

      if( this.wid < this.view.w || this.hei < this.view.h ) this.reCenter();

      // Delete our image tiles
      this.canvas.getChildren('img').destroy();
      this.tiles.empty();

      this.requestImages();
      this.positionZone();
      if( this.scale ) this.updateScale();
      this.touch.limit = {x: this.view.w - this.wid, y: this.view.h - this.hei};
      this.touch.disableX = (this.wid < this.view.w)? true : false;
      this.touch.disableY = (this.hei < this.view.h)? true : false;

    }
  },


  /* Calculate some dimensions
   */
  calculateSizes: function(){

    var tx = this.max_size.w;
    var ty = this.max_size.h;
    var thumb_width;

    // Set up our default sizes 
    var target_size = document.id(this.source).getSize();
    this.view.w = target_size.x;
    this.view.h = target_size.y;
		
		//NG CHANGE allow for absolute nav size.
		if (this.navWinSize < 1)
			{thumb_width = this.view.w * this.navWinSize;
			 // For panoramic images, use a large navigation window
    	 if( tx > 2*ty ) thumb_width = this.view.w / 2;}
		else
			{thumb_width = this.navWinSize;}  
			
    //if( (ty/tx)*thumb_width > this.view.h*0.5 ) thumb_width = Math.round( this.view.h * 0.5 * tx/ty );

    this.navWin.w = thumb_width;
    this.navWin.h = Math.round( (ty/tx)*thumb_width );
				
		//NG CHANGE ensure that the nav window is not taller than viewer window
		if (this.view.h < this.navWin.h)
		 {this.navWin.h = Math.round(this.view.h * 0.5);
		  this.navWin.w = Math.round(this.navWin.h*(tx/ty));}  
		 		
		//NG CHANGE ensure that the nav window is hidden for smaller 
		//viewer windows.
		if (( target_size.x < (2*this.navWin.w) || 
			target_size.y < (2*this.navWin.h) ))// && !this.forceControls)
		 {this.navigation = 'none';}  

    // Determine the image size for this image view
    this.res = this.num_resolutions;
    tx = this.max_size.w;
    ty = this.max_size.h;

    // Calculate our list of resolution sizes and the best resolution
    // for our window size		
    this.resolutions = new Array(this.num_resolutions);
    this.resolutions.push({w:tx,h:ty});
    this.res = 0;
		
		//alert(this.source + " --> " + this.res + " : " + this.num_resolutions +
		// " : " + tx + " : " + ty + " : " + this.view.w + " : " + this.view.h);
    for( var i=1; i<this.num_resolutions; i++ ){
      tx = Math.floor(tx/2);
      ty = Math.floor(ty/2);
      this.resolutions.push({w:tx,h:ty});
      if( tx < this.view.w && ty < this.view.h ) this.res++;
    }
    this.res -= 1;

    // We reverse so that the smallest resolution is at index 0
    this.resolutions.reverse();		
    this.wid = this.resolutions[this.res].w;
    this.hei = this.resolutions[this.res].h;

  },

//NG CHANGE Extra function added to allow dynamic resizing of the viewer
/* Refresh our main and navigation windows
   */
  refreshWindows: function(extra){
		
    var target_size = $(this.source).getSize();
    this.view.w = target_size.x;
    this.view.h = target_size.y;
				
		if ($(this.source+'_navcontainer'))
		{
		var pleft = target_size.x - this.navWin.w - 12;
		$(this.source+'_navcontainer').setStyles({
    	'top': '10px',
			'left': target_size.x - this.navWin.w - 12 + 'px'
			});		
		}		
	
		// Clear existing tiles if a full refresh is needed, for example 
		// dynamic contrast adjustment.
		
		// Problem with fully zoomed out, just fully zoomed out works fine, 
		// mouse wheel out again then means the tile disappears on contrast adjust.
		if (extra == 'recenter')
			{if (this.canvas) {this.reCenter();}}
		else if (extra)
			{this.canvas.getChildren('img').destroy();
       this.tiles.empty();}

    this.positionZone();		
		this.requestImages();
  },

  /* Create our main and navigation windows
   */
  createWindows: function(){

    // Setup our class. Get it's current position as we will convert it to absolute positioning
    var pos = document.id(this.source).getPosition();
		var size = document.id(this.source).getSize();
		//NG CHANGE: function "set" change to "addClass"
    document.id(this.source).addClass('iipmooviewer');
    document.id(this.source).setStyles({
      //'position': 'absolute',
      //'left': pos.x,
      //'top': pos.y,
      //'width': size.x,
      //'height': size.y
    });

    // Our modal information box
    new Element( 'div', {
	'class': 'info',
	'styles': { opacity: 0 },
	'events': {
		click: function(){ this.fade(0); }
	},
	'html': '<div><div><h2><a href="http://iipimage.sourceforge.net"><img src="'+this.prefix+'iip.32x32.png"/></a>IIPMooViewer</h2>IIPImage Ajax High Resolution Image Viewer - Version 2.0<br/><ul><li>To navigate within image: drag image within main window or drag zone within the navigation window or click an area within navigation window</li><li>To zoom in: double click with the mouse or use the mouse scroll wheel or simply press the "+" key</li><li>To zoom out: shift double click with the mouse or use the mouse wheel or press the "-" key</li><li>To move the navigation window: drag navigation window toolbar</li><li>To show / hide navigation window: press the "h" key</li><li>To show / hide navigation buttons: double click navigation window toolbar</li><li>To resize to full screen: press the "F11" key<li>To highlight any annotations: press the "a" key</li><li>To rotate image clockwise: press the "r" key, anti-clockwise: press shift and "r"</li></ul><br/>For more information visit <a href="http://iipimage.sourceforge.net">http://iipimage.sourceforge.net</a></div></div>'
    }).inject( this.source );

    // Create our main window target div, add our events and inject inside the frame
    this.canvas = new Element('div', {
	'class': 'canvas',
	'morph': { transition: Fx.Transitions.Quad.easeInOut,
		   onComplete: function(){
			this.requestImages();
			this.positionZone();
		   }.bind(this)
	       }
    } );
/*
    if( this.effects ){
	this.touch = new Touch( this.canvas ).addEvent('end', this.scroll.bind(this) );
	this.touch.limit = {x: this.view.w - this.wid, y: this.view.h - this.hei};
    }
    else{
	this.touch = new Drag( this.canvas, {
		onComplete: this.scroll.bind(this),
		limit: {x: this.view.w - this.wid, y: this.view.h - this.hei}
	});
    }
*/
/*
    this.touch = new Touch( this.canvas, this.effects ).addEvent('end', this.scroll.bind(this) );
    this.touch.limit = {x: this.view.w - this.wid, y: this.view.h - this.hei};
    */

    this.touch = new Drag( this.canvas, {
      onComplete: this.scroll.bind(this),
      limit: {x: this.view.w - this.wid, y: this.view.h - this.hei}
    });


    this.canvas.inject( this.source );
    this.canvas.addEvents({
	'mousewheel': this.zoom.bind(this),
        'dblclick': this.zoom.bind(this),
	'mousedown': function(e){ var event = new Event(e); event.stop(); }
    });

    // Display / hide our annotations if we have any
    if( this.annotations ){
      this.canvas.addEvent( 'mouseenter', function(){
	  this.canvas.getElements('div.annotation').tween( 'opacity', [0,1] );
        }.bind(this)
      );
      this.canvas.addEvent( 'mouseleave', function(){
	  // Don't fade out if over the tip itself
			      //	  if( this.annotationTip.tip.active == true ) return;
	  this.canvas.getElements('div.annotation').tween('opacity',0);
	}.bind(this)
      );
    }

    // Disable the right click context menu if requested
    if( this.disableContextMenu ){
      this.canvas.addEvent( 'contextmenu', function(e){
					   var event = new Event(e);
					   event.stop();
					   return false;
					 });
    }

/*
    new Element( 'div', {
		 id: 'context',
		 'class': 'tip',
		 'html': '<img src="'+this.prefix+'iip-favicon.png"/>IIPMooViewer 2.0&nbsp;'
		} ).inject(this.source)

    new ContextMenu({ menu: 'context' });
*/

    // Add an external callback if we have been given one
    if( this.targetclick ) this.canvas.addEvent( 'click', this.targetclick.bindWithEvent(this) );

  // Add our key press and window resize events
	
	if(this.winResize) window.addEvent( 'resize', this.reload.bind(this) );


    document.addEvent( 'keydown', this.key.bind(this) );
    /*    this.keyboard = new Keyboard({
      events: {
	  '+': function(){ alert('+'); },
	    'minus': this.zoomOut.bind(this),
	    'left': this.nudge.bind(this),
	    // For removing the navigation window if it exists - must use the get('reveal')
	    // otherwise we do not have the Mootools extended object
	    'h': function(){
	    if( document.id(this.source).getElement('div.navcontainer') ){
	      document.id(this.source).getElement('div.navcontainer').get('reveal').toggle();
	      this.canvas.getElements('div.annotation').get('reveal').each( function(el){ el.toggle() });
	    }
	  }.bind(this)
      }
    });
    this.keyboard.activate();
    */


    // Add gesture support for zooming on the iPhone
    if( Browser.Platform.ios || Browser.Platform.android ){

	this.canvas.addListener('gesturestart', function(e){
	  event.preventDefault();
	  this.touch.detach();
	  this.touch.speedX=0;
	  this.touch.speedY=0;
	  this.touch.hasDragged=false;
	  this.touch.fx.cancel();
	}.bind(this) );

	this.canvas.addListener('gesturechange', function(e){
	  event.preventDefault();
	  this.touch.attach();
	  this.touch.speedX=0;
	  this.touch.speedY=0;
	  this.touch.fx.cancel();
	}.bind(this) );

	this.canvas.addListener('gestureend', function(e){
	  this.touch.attach();
	  if( e.scale > 1 || e.rotate > 0 ) this.zoomIn();
	  else this.zoomOut();
	  event.preventDefault();
	}.bind(this) );

    }

	//NG CHANGE Allow the icon to be hidden
	if (this.hideIcon)
    {var info = null;}
	else
    {
    // Add our logo and a tooltip explaining how to use the viewer
    var info = new Element( 'img', {
	'src': this.prefix+'iip.32x32.png',
	'class': 'logo',
	'title': 'click for help',
	'styles': { opacity: Browser.ie? 1:0.65 },
	//'display': idisplay,
	'events': {
	    click: function(){ document.id(this.source).getElement('div.info').fade(0.9); }.bind(this),
	    // Don't apply opacity changes to the IE
	    mouseover: function(){ if(!Browser.ie) this.fade(1); },
	    mouseout: function(){ if(!Browser.ie) this.fade(0.65); },
	    // Prevent user from dragging image
	    mousedown: function(e){ var event = new Event(e); event.stop(); }
				}
    	}).inject(this.source);
			
		// If our navigation window has been set top left, move the logo to 
		// the top right
		if( this.navigation == 'top left' ){
			info.setStyles({
	   	right: 0,
	   	left: 'auto'});
    	}
		}
		
    // Add some information or credit
    if( this.credit ){
      new Element( 'div', {
	'class': 'credit',
	'html': this.credit,
	'styles': { opacity: 0.6 },
	'events': {
	  // We specify the start value to stop a strange problem where on the first
	  // mouseover we get a sudden transition to opacity 1.0
	  mouseover: function(){ this.fade([0.6,0.9]); },
	  mouseout: function(){ this.fade(0.6); }
	}
      }).inject(this.source);
    }



    // Add a scale if requested. Make it draggable and add a tween transition on rescaling
    if( this.scale ){
      var scale = new Element( 'div', {
	 'class': 'scale',
	 'title': 'scale',
	 'html': '<div></div>'
      }).inject(this.source);
      scale.makeDraggable({container: this.source});
      scale.getElement('div').set('tween', {
         transition: Fx.Transitions.Quad.easeInOut
      });
    }



    // Fix IE7/IE8 PNG transparency problem
/*    if( Browser.Engine.trident5 ){
      info.setStyle( 'filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src='+this.prefix+'"iip.32x32.png",sizingMethod=scale)' );
    }
*/


    // Calculate some sizes and create the navigation window
		this.calculateSizes();
    this.createNavigationWindow();
    this.createAnnotations();

    new Tips( 'img.logo, div.toolbar, div.scale', {
	  className: 'tip', // We need this to force the tip in front of nav window
	  onShow: function(tip,el){
	    tip.setStyles({
	       visibility: 'hidden',
	       display: 'block'
	    }).fade([0,0.9]);
	  },
	  onHide: function(tip, el){
	    tip.fade('out').get('tween').chain( function(){ tip.setStyle('display', 'none'); } );
	  }
    });

    // Center our view
    this.reCenter();

    this.canvas.setStyles({
	width: this.wid,
	height: this.hei
    });

		// Load our images
		this.requestImages();
    this.positionZone();
    if( this.scale ) this.updateScale();
		
		//NG CHANGE Allow initialZoom to have effect
		//might it be good to call this initialRes??
		
		/*		
		if( this.initialZoom || this.initialZoom === 0 )
			{
			if( this.initialZoom < this.num_resolutions-1 )
				{this.res =  this.initialZoom + 1;
				 this.zoomIn();}
			}
		
		if(( this.initialX || this.initialX === 0 ) &&
		 ( this.initialY || this.initialY === 0 ))
			{
			alert (this.initialZoom);
			this.res =  this.initialZoom;
			this.scrollTo(this.initialX, this.initialY);
			//alert (2);
			
			}
		//	*/
			
	},



  /* Create our navigation window
   */
  createNavigationWindow: function() {

    // If the user does not want a navigation window, do not create one!
		//NG CHANGE hiding navigation allows user to toggle appearance
		//Also not creating can cause errors to do with zone position as 
		//this.showNavWindow = null; is not forced.
    if(this.navigation=='none')
			{var disp = 'none';}
    else
      {var disp = 'block';}

    var navcontainer = new Element( 'div', {
			'id': this.source+'_navcontainer',
      'class': 'navcontainer',
      'styles': {
	width: this.navWin.w,
	'display': disp
      }
    });

    //    navcontainer.inject(this.source);

    /* Make our navigation window resizable
     
              navcontainer.makeResizable({
		   onDrag: function(){
		document.id('navigation').setStyles({
		    width: document.id('navcontainer').getSize().x - 10,
		    height: document.id('navcontainer').getSize().y - 50
		});
      }
      });
    */

    var toolbar = new Element( 'div', {
      'class': 'toolbar',
      'events': {
	 dblclick: function(source){
	   document.id(source).getElement('div.navbuttons').slide('toggle');
	}.pass(this.source)
      }
    });
    toolbar.store( 'tip:text', '* Drag to move<br/>* Double Click to show/hide navigation buttons' );
    toolbar.inject(navcontainer);

    // Create our navigation div and inject it inside our frame if requested
    if( this.showNavWindow ){

	var navwin = new Element( 'div', {
	      'class': 'navwin',
	      'styles': {
//		width: this.navWin.w,
		height: this.navWin.h
	      }
	});
	navwin.inject( navcontainer );


	// Create our navigation image and inject inside the div we just created
	var navimage = new Element( 'img', {
	   'class': 'navimage',
	   'src': this.server + '?FIF=' + this.images[0].src + '&SDS=' + this.images[0].sds + '&CNT=1.0' +
                '&WID=' + this.navWin.w + '&QLT=99&CVT=jpeg',
	   'events': {
	      click: this.scrollNavigation.bind(this),
	      mousewheel: this.zoom.bind(this),
	      // Prevent user from dragging navigation image
	      mousedown: function(e){ var event = new Event(e); event.stop(); }
            }
        });
	navimage.inject(navwin);


	// Create our navigation zone and inject inside the navigation div
	this.zone = new Element( 'div', {
	   'class': 'zone',
           'styles': {
	      opacity: 0.4
            },
            'morph': {
	      duration: 500,
	      transition: Fx.Transitions.Quad.easeInOut
            },
	    'events': {
 	      mousewheel: this.zoom.bind(this),
 	      dblclick: this.zoom.bind(this)
	    }
        });
	this.zone.inject(navwin);

    }


    // Create our nav buttons if requested
    if( this.showNavButtons ){

      var navbuttons = new Element('div', {
          'class': 'navbuttons',
	  'html': '<img class="zoomIn" src="'+this.prefix+'zoomIn.png"/><img class="zoomOut" src="'+this.prefix+'zoomOut.png"/><img class="reset" src="'+this.prefix+'reset.png"/><img class="corner" src="'+this.prefix+'corner.png"/>'
//          'html': '<img class="shiftLeft" src="'+this.prefix+'left.png"/><img class="shiftUp" src="'+this.prefix+'up.png"/><img class="shiftRight" src="'+this.prefix+'right.png"/><br/><img class="shiftDown" src="'+this.prefix+'down.png"/><br/><img class="zoomIn" src="'+this.prefix+'zoomIn.png"/><img class="zoomOut" src="'+this.prefix+'zoomOut.png"/><img class="reset" src="'+this.prefix+'reset.png"/><img class="corner" src="'+this.prefix+'corner.png"/>';
      });

      navbuttons.inject(navcontainer);

      // Need to set this after injection
      navbuttons.set('slide', {duration: 300, transition: Fx.Transitions.Quad.easeInOut, mode:'vertical'});

//      navcontainer.inject(this.source);

      // Needed as IE doesn't take CSS opacity into account
      if( Browser.ie ){
	  $$('div.navbuttons, div.navbuttons img').setStyle( 'opacity', 0.75 );
      }

      navbuttons.getChildren('img').each( function(el){
	var cl = el.get('class');
	if( cl == 'zoomIn' ) el.addEvent( 'click', this.zoomIn.bind(this) );
	else if( cl == 'zoomOut' ) el.addEvent( 'click', this.zoomOut.bind(this) );
	else if( cl == 'reset' ) el.addEvent( 'click', this.reload.bind(this) );
	/*
	  else if( cl == 'shiftLeft' ) el.addEvent( 'click', function(){ this.nudge(-this.view.w/3,0); }.bind(this) );
	  else if( cl == 'shiftUp' ) el.addEvent( 'click', function(){ this.nudge(0,-this.view.h/3); }.bind(this) );
	  else if( cl == 'shiftDown' ) el.addEvent( 'click', function(){ this.nudge(0,this.view.h/3); }.bind(this) );
	  else if( cl == 'shiftRight' ) el.addEvent( 'click', function(){ this.nudge(this.view.w/3,0); }.bind(this) );
	*/
      }.bind(this));
    }

    // Add a progress bar only if we have the navigation window visible
    if( this.showNavWindow ){

	// Create our progress bar
	var loadBarContainer = new Element('div', {
	   'class': 'loadBarContainer',
           'html': '<div class="loadBar"></div>',
           'styles': {
             width: this.navWin.w - 2
           },
           'tween': {
             duration: 1000,
             transition: Fx.Transitions.Sine.easeOut,
	     link: 'cancel'
           }
	 });
	loadBarContainer.inject(navcontainer);
    }


    navcontainer.inject(this.source);


    if( this.showNavWindow ){
       	this.zone.makeDraggable({
	    container: document.id(this.source).getElement('div.navcontainer div.navwin'),
            // Take a note of the starting coords of our drag zone
            onStart: function() {
	      var pos = this.zone.getPosition();
	      this.navpos = {x: pos.x, y: pos.y-10};
            }.bind(this),
            onComplete: this.scrollNavigation.bind(this)
        });
    }

//    navcontainer.makeDraggable( {handle:toolbar} );
    navcontainer.makeDraggable( {container:this.source, handle:toolbar} );

    // Apply our styling options to the container
    if( this.navigation == 'top left' ){
	navcontainer.setStyles({left: 10, right: 'auto', top: 10});
    }
    else if( this.navigation == 'bottom left' ){
	var pos = document.id(this.source).getPosition().y + document.id(this.source).getSize().y - navcontainer.getSize().y - 10;
	navcontainer.setStyles({left: 10, right: 'auto', top: pos});
    }
    else if( this.navigation == 'bottom right' ){
	var pos = document.id(this.source).getPosition().y + document.id(this.source).getSize().y - navcontainer.getSize().y - 10;
	navcontainer.setStyles({left: 'auto', right: 10, top: pos});
    }
    else{
	navcontainer.setStyles({left: 'auto', left: document.id(this.source).getSize().x-this.navWin.w-10, top: 10});
    }

  },


  // Create annotations if they are contained within our current view
  createAnnotations: function() {

    // Sort our annotations by size to make sure it's always possible to interact
    // with annotations within annotations
    if( !this.annotations ) return;
    this.annotations.sort( function(a,b){ return (b.w*b.h)-(a.w*a.h); } );

    for( var i=0; i<this.annotations.length; i++ ){

      // Check whether this annotation is within our view
      if( this.wid*(this.annotations[i].x+this.annotations[i].w) > this.view.x &&
	  this.wid*this.annotations[i].x < this.view.x+this.view.w &&
	  this.hei*(this.annotations[i].y+this.annotations[i].h) > this.view.y &&
	  this.hei*this.annotations[i].y < this.view.y+this.view.h
	  // Also don't show annotations that entirely fill the screen
	  //	  (this.hei*this.annotations[i].x < this.view.x && this.hei*this.annotations[i].y < this.view.y &&
	  //	   this.wid*(this.annotations[i].x+this.annotations[i].w) > this.view.x+this.view.w && 
      ){

	var annotation = new Element('div', {
          'class': 'annotation',
          'styles': {
            left: Math.round(this.wid * this.annotations[i].x),
            top: Math.round(this.hei * this.annotations[i].y ),
	    width: this.wid * this.annotations[i].w,
	    height: this.hei * this.annotations[i].h
          }
        }).inject( this.canvas );

        annotation.store( 'tip:text', this.annotations[i].text );
      }
    }


    if( !this.annotationTip ){
      this.annotationTip = new Tips( 'div.annotation', {
        className: 'tip', // We need this to force the tip in front of nav window
	fixed: true,
	offset: {x:30,y:30},
	hideDelay: 300,
	link: 'chain',
        onShow: function(t,el){
           this.tip.fade(0.9);
	   // Prevent the tip from fading when we are hovering on the tip itself and not
	   // just when we leave the annotated zone
	   this.tip.addEvents({
		'mouseleave':  function(){ this.active = false; this.fade(0); },
		'mouseenter': function(){ this.active = true; }
	   })
        },
        onHide: function(t, el){
	   if( !this.tip.active ){
		this.tip.fade(0);
		this.tip.removeEvents(['mouseenter','mouseleave']);
	   }
        }
      });
    }
  },



  highlightAnnotations: function() {
    this.canvas.getElements('div').tween('opacity',[0,1])
  },


  refreshLoadBar: function() {

    // Update the loaded tiles number, grow the loadbar size
    var w = (this.nTilesLoaded / this.nTilesToLoad) * this.navWin.w;

    var loadBarContainer = document.id(this.source).getElement('div.navcontainer div.loadBarContainer');
    var loadBar = loadBarContainer.getElement('div.loadBar');
    loadBar.setStyle( 'width', w );

    // Display the % in the progress bar
    loadBar.set( 'html', 'loading&nbsp;:&nbsp;'+Math.round(this.nTilesLoaded/this.nTilesToLoad*100) + '%' );

    if( loadBarContainer.style.opacity != 0.85 ){
      loadBarContainer.setStyle( 'opacity', 0.85 );
    }

    // If we're done with loading, fade out the load bar
    if( this.nTilesLoaded >= this.nTilesToLoad ){
      // Fade out our progress bar and loading animation in a chain
      this.canvas.setStyle( 'cursor', 'move' );
      loadBarContainer.fade('out');
    }

  },



  /* Update the scale on our image - change the units if necessary
   */
  updateScale: function() {
		//NG CHANGE Make function more flexible and generic, allowing for use with maps and microscope images
		var dims = ["km", "m", "mm", "µm", "nm", "pm"];
		var lbv = ["500", "100", "50", "10", "5", "1"];
    var pixels = 1000 * 1000 * this.scale * this.wid / this.max_size.w; // x1000000 because we want per km
    var sw = this.view.w/10;
		var lv = sw/pixels;
		pixels = sw;
		
		// Select a unit
		var ind = 0;		
    while (lv < 1){
			lv = lv * 1000
			ind++;
    }
		
		// Select a label value
		var cn = 0;		
		var li = 0;
		while (cn < 1){
			var nc = pixels * (lbv[li]/lv);
			if (nc < (this.view.w/3) && nc > 50)
				{pixels = nc;
				 lv = lbv[li];
				 cn = 1;}
			
			if (li == 4) {cn = 1;}
			else {li++;}
			}
		
		var label = Math.round(lv)+" "+dims[ind];

    // Use a smooth transition to resize
    document.id(this.source).getElement('div.scale div').set( 'html', label ).tween( 'width', pixels );

  },



  /* Use a AJAX request to get the image size, tile size and number of resolutions from the server
   */
  load_old: function(){

    new Request(
    {
	method: 'get',
	url: this.server,
	onComplete: function(transport){
	    var response = transport || alert( "No response from server " + this.server );
	    var tmp = response.split( "Max-size" );
	    if(!tmp[1]) alert( "Unexpected response from server " + this.server );
	    var size = tmp[1].split(" ");
	    this.max_size = { w: parseInt(size[0].substring(1,size[0].length)),
			      h: parseInt(size[1]) };
	    tmp = response.split( "Tile-size" );
	    size = tmp[1].split(" ");
	    this.tileSize = { w: parseInt(size[0].substring(1,size[0].length)),
	    		      h: parseInt(size[1]) };
	    tmp = response.split( "Resolution-number" );
	    this.num_resolutions = parseInt( tmp[1].substring(1,tmp[1].length) );
	    this.createWindows();
        }.bind(this),
	onFailure: function(){ alert('Unable to get image and tile sizes from server!'); }
    } ).send( "FIF=" + this.images[0].src + "&obj=IIP,1.0&obj=Max-size&obj=Tile-size&obj=Resolution-number" );
  },
	
	//NG CHANGE additional load functionality
	/* 
	 * Use a AJAX request to get the image size, tile size and number of 
	 * resolutions from the server. Aditional option for calling variables 
	 * via a sever side script added, allows for images on remote servers 
	 * or calling values based on database queries.
   */
  load: function()
		{  
	 	imageRequest = new Request(
    	{
			method: 'get',
			url: this.server,
			onComplete: function(transport){
	    	var response = transport || alert( "No response from server " + this.server );
	    	var tmp = response.split( "Max-size" );
	    	if(!tmp[1]) alert( "Unexpected response from server " + this.server );
	    	var size = tmp[1].split(" ");
	    	this.max_size = { w: parseInt(size[0].substring(1,size[0].length)),
			  	h: parseInt(size[1]) };
	    	tmp = response.split( "Tile-size" );
	    	size = tmp[1].split(" ");
	    	this.tileSize = { w: parseInt(size[0].substring(1,size[0].length)),
	    		h: parseInt(size[1]) };
	    	tmp = response.split( "Resolution-number" );
	    	this.num_resolutions = parseInt( tmp[1].substring(1,tmp[1].length));
	    	this.res = this.num_resolutions;
				this.createWindows();
        }.bind(this),
			onFailure: function(){ alert('Unable to get image and tile sizes from server!'); }
    	});
	
		ajaxRequest = new Request(
    	{
			method: 'get',
			url: 'ajax.php?which='+this.ajax_which+'&extra'+this.ajax_extra,
			onComplete: function(transport){
	    	var response = transport || alert( "No response from server " + this.server );
	   		var loc_vals = new Array ();
				var new_annotations = false;
			
				eval ('loc_vals = ' + response);
				this.images = new Array(1);
      	this.images = [{ src:loc_vals['image'], sds:"0,90"} ];
      	this.server = loc_vals['server'];
	    
			  this.max_size = { w: parseInt(loc_vals['max_width']),
			  	h: parseInt(loc_vals['max_height']) };

	    	this.tileSize = { w: parseInt(loc_vals['tile_size']),
	    		h: parseInt(loc_vals['tile_size']) };

	    	this.num_resolutions = loc_vals['num_resolution'];
	    	this.res = this.num_resolutions;
	    
	    	// Credit can be dynamically updated if required.
	    	if (!this.credit && loc_vals['credit'])
	      	{this.credit = loc_vals['credit'];}
	    
				if (loc_vals['initial_zoom'])
					{
					if (loc_vals['initial_zoom'] < 0) 
						{this.initialZoom = 0;}
					else if (loc_vals['initial_zoom'] >= this.num_resolutions) 
						{this.initialZoom = this.num_resolutions - 1;}
					else
						{this.initialZoom = loc_vals['initial_zoom']}
					}
					
				if (new_annotations)
					{this.annotations = new_annotations;
					 //alert (this.annotations[0]["text"]);
					 }
 
      	this.createWindows();	    	    

/*
				if ((loc_vals['initial_x'] || loc_vals['initial_x'] == 0) &&
					(loc_vals['initial_y'] || loc_vals['initial_y'] == 0))
					{
					if (loc_vals['initial_x'] < 0) 
						{loc_vals['initial_x'] = 0;}
					else if  (loc_vals['initial_x'] > (this.wid - this.view.w))
						{loc_vals['initial_x'] = this.wid - this.view.w;}

					if (loc_vals['initial_y'] < 0) 
						{loc_vals['initial_y'] = 0;}
					else if  (loc_vals['initial_y'] > (this.hei - this.view.h))
						{loc_vals['initial_y'] = this.hei - this.view.h;}

					this.scrollTo( loc_vals['initial_x'], loc_vals['initial_y'] );
					}*/							         
      	}.bind(this),
			onFailure: function(){ alert('Unable to get image and tile sizes from server!'); }
    	});
		
	if(this.ajax_which)
		{ajaxRequest.send();}
	else if(this.image_vars)
		{
		this.max_size = { w: parseInt(this.image_vars['max_width']),
			  	h: parseInt(this.image_vars['max_height']) };
		this.tileSize = { w: parseInt(this.image_vars['tile_size']),
	    		h: parseInt(this.image_vars['tile_size']) };
		this.num_resolutions = this.image_vars['num_resolution'];
	  this.res = this.num_resolutions;
	  this.createWindows();	
		}
	else
		{imageRequest.send( "FIF=" + this.images[0].src + 
			"&obj=IIP,1.0&obj=Max-size&obj=Tile-size&obj=Resolution-number" );}
  },

  /* Reload our view
   */
  reload: function(){
    // First cancel any effects on the canvas and delete the tiles within
		this.canvas.get('morph').cancel();
    this.canvas.getChildren('img').destroy();
    this.tiles.empty();
    this.calculateSizes();

    // Resize our navigation window
    document.id(this.source).getElements('div.navcontainer, div.navcontainer div.loadBarContainer').setStyle('width', this.navWin.w);

    // And reposition the navigation window
    var navcontainer = document.id(this.source).getElement('div.navcontainer');
    navcontainer.setStyles({
      'top': 10,
      'left': document.id(this.source).getSize().x - navcontainer.getSize().x - 10
    });

    // Resize our navigation window image
    if(this.zone){
      this.zone.getParent().setStyles({
	height: this.navWin.h
      });
    }

    // Reset and reposition our scale
    if( this.scale ){
      this.updateScale();
      pos = document.id(this.source).getSize().y -
	document.id(this.source).getElement('div.scale').getSize().y - 10;
      document.id(this.source).getElement('div.scale').setStyles({
	'left': 10,
	'top': pos
      });
    }

    // Resize the main tile canvas
    this.canvas.setStyles({
      width: this.wid,
      height: this.hei
    });

    this.reCenter();
    this.requestImages();
    this.positionZone();

    this.touch.limit = {x: this.view.w - this.wid, y: this.view.h - this.hei}; 
  },


  /* Recenter the image view
   */
  reCenter: function(){

    // Calculate the x,y for a centered view, making sure we have no negative
    // in case our resolution is smaller than the viewport
    var xoffset = Math.round( (this.wid-this.view.w)/2 );
    this.view.x = (xoffset<0)? 0 : xoffset;

    var yoffset = Math.round( (this.hei-this.view.h)/2 );
    this.view.y = (yoffset<0)? 0 : yoffset;

    // Center our canvas, taking into account images smaller than the viewport
    this.canvas.setStyles({
      left: (this.wid>this.view.w)? -this.view.x : Math.round((this.view.w-this.wid)/2),
      top : (this.hei>this.view.h)? -this.view.y : Math.round((this.view.h-this.hei)/2)
    });
  },



  /* Reposition the navigation rectangle on the overview image
   */
  positionZone: function(){

    if( !this.showNavWindow ) return;

    var pleft = (this.view.x/this.wid) * (this.navWin.w);
    if( pleft > this.navWin.w ) pleft = this.navWin.w;
    if( pleft < 0 ) pleft = 0;

    var ptop = (this.view.y/this.hei) * (this.navWin.h);
    if( ptop > this.navWin.h ) ptop = this.navWin.h;
    if( ptop < 0 ) ptop = 0;

    var width = (this.view.w/this.wid) * (this.navWin.w);
    if( pleft+width > this.navWin.w ) width = this.navWin.w - pleft;

    var height = (this.view.h/this.hei) * (this.navWin.h);
    if( height+ptop > this.navWin.h ) height = this.navWin.h - ptop;

    var border = this.zone.offsetHeight - this.zone.clientHeight;
				
    // Move the zone to the new size and position
    this.zone.morph({
	left: pleft,
	top: ptop + 10, // 10px for the toolbar
	width: width - border,
	height: height - border
    });

  }


});


