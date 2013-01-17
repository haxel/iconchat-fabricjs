(function(global) {

  "use strict";

  var extend = fabric.util.object.extend;

  if (!global.fabric) {
    global.fabric = { };
  }

  if (global.fabric.SpriteSheet) {
    fabric.warn('fabric.SpriteSheet is already defined.');
    return;
  }

  var Rectangle = function(x, y, width, height){
    this.x = (x == null ? 0 : x);
    this.y = (y == null ? 0 : y);
    this.width = (width == null ? 0 : width);
    this.height = (height == null ? 0 : height);
  }

  /**
   * SpriteSheet class
   * @class SpriteSheet
   * @extends fabric.Object
   */
  fabric.SpriteSheet = fabric.util.createClass(fabric.Object, /** @scope fabric.SpriteSheet.prototype */ {
     

    // public properties:
    /**
     * Read-only property indicating whether all images are finished loading.
     * @property complete
     * @type Boolean
     **/
    complete : true,

    /**
     * @property _animations
     * @protected
     **/
    _animations : null,

    /**
     * @property _frames
     * @protected
     **/
    _frames : null,

    /**
     * @property _images
     * @protected
     **/
    _images : null,

    /**
     * @property _data
     * @protected
     **/
    _data : null,

    /**
     * @property _loadCount
     * @protected
     **/
    _loadCount : 0,

    // only used for simple frame defs:
    /**
     * @property _frameHeight
     * @protected
     **/
    _frameHeight : 0,

    /**
     * @property _frameWidth
     * @protected
     **/
    _frameWidth : 0,

    /**
     * @property _numFrames
     * @protected
     **/
    _numFrames : 0,

    /**
     * @property _regX
     * @protected
     **/
    _regX : 0,

    /**
     * @property _regY
     * @protected
     **/
    _regY : 0,
    
    index : 0,

    initialize: function(options) {
      this.callSuper('initialize', options);
      this.width = 100;
      this.height = 100;
    },

    fromJSON : function(data,callback) {

      var i,l,o,a;
      if (data == null) { return; }

      // parse images:
      if (data.images && (l=data.images.length) > 0) {
        a = this._images = [];
        for (i=0; i<l; i++) {
          var img = data.images[i];
          if (typeof img == "string") {
            var src = img;
            img = fabric.document.createElement('img');
            img.src = src;
          }
          a.push(img);
          if (!img.getContext && !img.complete) {
            this._loadCount++;
            this.complete = false;
            (function(o) { 
              img.onload = function() { 
                if (--o._loadCount == 0) {
                  o._calculateFrames();
                  o.complete = true;
                  callback(o);
                }
              } 
            })(this);
          }
        }
      }

      // parse frames:
      if (data.frames == null) { // nothing
      } else if (data.frames instanceof Array) {
        this._frames = [];
        a = data.frames;
        for (i=0,l=a.length;i<l;i++) {
          var arr = a[i];
          this._frames.push({image:this._images[arr[4]?arr[4]:0], rect:new Rectangle(arr[0],arr[1],arr[2],arr[3]), regX:arr[5]||0, regY:arr[6]||0 });
        }
      } else {
        o = data.frames;
        this._frameWidth = o.width;
        this._frameHeight = o.height;
        this._regX = o.regX||0;
        this._regY = o.regY||0;
        this._numFrames = o.count;
        if (this._loadCount == 0) { this._calculateFrames(); }
      }

      // parse animations:
      if ((o=data.animations) != null) {
        this._animations = [];
        this._data = {};
        var name;
        for (name in o) {
          var anim = {name:name};
          var obj = o[name];
          if (typeof obj == "number") { // single frame
            a = anim.frames = [obj];
          } else if (obj instanceof Array) { // simple
            anim.frequency = obj[3];
            anim.next = obj[2];
            a = anim.frames = [];
            for (i=obj[0];i<=obj[1];i++) {
              a.push(i);
            }
          } else { // complex
            anim.frequency = obj.frequency;
            anim.next = obj.next;
            var frames = obj.frames;
            a = anim.frames = (typeof frames == "number") ? [frames] : frames.slice(0);
          }
          anim.next = (a.length < 2 || anim.next == false) ? null : (anim.next == null || anim.next == true) ? name : anim.next;
          if (!anim.frequency) { anim.frequency = 1; }
          this._animations.push(name);
          this._data[name] = anim;
        }
      }
    },

    /**
     * @method _calculateFrames
     * @protected
     **/
    _calculateFrames : function() {
      if (this._frames || this._frameWidth == 0) { return; }
      this._frames = [];
      var ttlFrames = 0;
      var fw = this._frameWidth;
      var fh = this._frameHeight;
      for (var i=0,imgs = this._images; i<imgs.length; i++) {
        var img = imgs[i];
        var cols = (img.width+1)/fw|0;
        var rows = (img.height+1)/fh|0;
        var ttl = this._numFrames>0 ? Math.min(this._numFrames-ttlFrames,cols*rows) : cols*rows;
        for (var j=0;j<ttl;j++) {
          this._frames.push({
            image:img, 
            rect:new Rectangle(j%cols*fw,(j/cols|0)*fh,fw,fh), 
            regX:this._regX, 
            regY:this._regY 
          });
        }
        ttlFrames += ttl;
      }
      this._numFrames = ttlFrames;
    },
    
    getNumFrames : function(animation) {
      if (animation == null) {
        return this._frames ? this._frames.length : this._numFrames;
      } else {
        var data = this._data[animation];
        if (data == null) { return 0; }
        else { return data.frames.length; }
      }
    },

    /**
     * Returns an object specifying the image and source rect of the specified frame. The returned object
     * has an image property holding a reference to the image object in which the frame is found,
     * and a rect property containing a Rectangle instance which defines the boundaries for the
     * frame within that image.
     * @method getFrame
     * @param {Number} frameIndex The index of the frame.
     * @return {Object} a generic object with image and rect properties. Returns null if the frame does not exist, or the image is not fully loaded.
   **/

    animate : function() {
      if (this.complete && this._frames) {
        this.index++;
        if(this.index >= this.getNumFrames('all')) this.index = 0;
      }
    },

    /**
     * @private
     * @method _render
     * @param ctx
     */
    _render: function(ctx) {
      var data = this._frames[this._data['all'].frames[this.index]];
      if (data) {
        var r = data.rect;
        ctx.drawImage(data.image, r.x, r.y, r.width, r.height, -data.regX, -data.regY, r.width, r.height);
      }
    }
  });
  
})(typeof exports !== 'undefined' ? exports : this);
