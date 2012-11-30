fabric.Image.filters.Highpass = fabric.util.createClass( {

// StackBoxBlur - a fast almost Box Blur For Canvas

// Version:  0.3
// Author:   Mario Klingemann
// Contact:  mario@quasimondo.com
// Website:  http://www.quasimondo.com/
// Twitter:  @quasimondo


// levels adjustment from https://github.com/talentedmrjones/Javascript-Canvas-Tools

  mul_table : [ 1,171,205,293,57,373,79,137,241,27,391,357,41,19,283,265,497,469,443,421,25,191,365,349,335,161,155,149,9,278,269,261,505,245,475,231,449,437,213,415,405,395,193,377,369,361,353,345,169,331,325,319,313,307,301,37,145,285,281,69,271,267,263,259,509,501,493,243,479,118,465,459,113,446,55,435,429,423,209,413,51,403,199,393,97,3,379,375,371,367,363,359,355,351,347,43,85,337,333,165,327,323,5,317,157,311,77,305,303,75,297,294,73,289,287,71,141,279,277,275,68,135,67,133,33,262,260,129,511,507,503,499,495,491,61,121,481,477,237,235,467,232,115,457,227,451,7,445,221,439,218,433,215,427,425,211,419,417,207,411,409,203,202,401,399,396,197,49,389,387,385,383,95,189,47,187,93,185,23,183,91,181,45,179,89,177,11,175,87,173,345,343,341,339,337,21,167,83,331,329,327,163,81,323,321,319,159,79,315,313,39,155,309,307,153,305,303,151,75,299,149,37,295,147,73,291,145,289,287,143,285,71,141,281,35,279,139,69,275,137,273,17,271,135,269,267,133,265,33,263,131,261,130,259,129,257,1],
        
  shg_table : [0,9,10,11,9,12,10,11,12,9,13,13,10,9,13,13,14,14,14,14,10,13,14,14,14,13,13,13,9,14,14,14,15,14,15,14,15,15,14,15,15,15,14,15,15,15,15,15,14,15,15,15,15,15,15,12,14,15,15,13,15,15,15,15,16,16,16,15,16,14,16,16,14,16,13,16,16,16,15,16,13,16,15,16,14,9,16,16,16,16,16,16,16,16,16,13,14,16,16,15,16,16,10,16,15,16,14,16,16,14,16,16,14,16,16,14,15,16,16,16,14,15,14,15,13,16,16,15,17,17,17,17,17,17,14,15,17,17,16,16,17,16,15,17,16,17,11,17,16,17,16,17,16,17,17,16,17,17,16,17,17,16,16,17,17,17,16,14,17,17,17,17,15,16,14,16,15,16,13,16,15,16,14,16,15,16,12,16,15,16,17,17,17,17,17,13,16,15,17,17,17,16,15,17,17,17,16,15,17,17,14,16,17,17,16,17,17,16,15,17,16,14,17,16,15,17,16,17,17,16,17,15,16,17,14,17,16,15,17,16,17,13,17,16,17,17,16,17,14,17,16,17,16,17,16,17,9],

  /**
   * @param {String} type
   */
  type: "Highpass",

  initialize: function(options) {
    options || (options = { });

    this.threshold = options.threshold || 128;
    this.radius = options.radius || 5;
    this.iterations = options.iterations || 1;

    this.gamma = options.gamma || 1;

    this.input = options.input || {
      min:0,
      max:255
    };

    this.output = options.output || {
      min:0,
      max:255
    };

    this.tmpCtx = fabric.document.createElement('canvas').getContext('2d');

  },

  _createImageData: function(w, h) {
    return this.tmpCtx.createImageData(w, h);
  },

  /**
   * @method applyTo
   * @param {Object} canvasEl Canvas element to apply filter to
   */
  applyTo: function(canvasEl) {

    var Floor=Math.floor
    ,Random=Math.random
    ,Pow=Math.pow
    ,Min=Math.min
    ,Max=Math.max;

    function BlurStack()
    {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      this.a = 0;
      this.next = null;
    }

    var context = canvasEl.getContext('2d');
    var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);

    var width = imageData.width;
    var height = imageData.height;
    var src = imageData.data;
      
    var output = this._createImageData(width, height);

    var dst = output.data;

    for (i = 0; i < src.length; i++) {
        dst[i] = src[i];
    }

    var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
      r_out_sum, g_out_sum, b_out_sum,
      r_in_sum, g_in_sum, b_in_sum,
      pr, pg, pb, rbs,av;
      
    var div = this.radius + this.radius + 1;
    var w4 = width << 2;
    var widthMinus1  = width - 1;
    var heightMinus1 = height - 1;
    var radiusPlus1  = this.radius + 1;
  
    var stackStart = new BlurStack();
    var stack = stackStart;
    for ( i = 1; i < div; i++ )
    {
      stack = stack.next = new BlurStack();
      if ( i == radiusPlus1 ) var stackEnd = stack;
    }
    stack.next = stackStart;
    var stackIn = null;
  
    var mul_sum = this.mul_table[this.radius];
    var shg_sum = this.shg_table[this.radius];
  
    while ( this.iterations-- > 0 ) {
      yw = yi = 0;
    
      for ( y = height; --y >-1; )
      {
        r_sum = radiusPlus1 * ( pr = src[yi] );
        g_sum = radiusPlus1 * ( pg = src[yi+1] );
        b_sum = radiusPlus1 * ( pb = src[yi+2] );
      
        stack = stackStart;
        
        for( i = radiusPlus1; --i > -1; )
        {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;
        }
      
        for( i = 1; i < radiusPlus1; i++ )
        {
          p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
          r_sum += ( stack.r = src[p++]);
          g_sum += ( stack.g = src[p++]);
          b_sum += ( stack.b = src[p]);
          
          stack = stack.next;
        }
      
        stackIn = stackStart;
        for ( x = 0; x < width; x++ )
        {
          src[yi++] = (r_sum * mul_sum) >>> shg_sum;
          src[yi++] = (g_sum * mul_sum) >>> shg_sum;
          src[yi++] = (b_sum * mul_sum) >>> shg_sum;
          yi++;
          
          p =  ( yw + ( ( p = x + this.radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
          
          r_sum -= stackIn.r - ( stackIn.r = src[p++]);
          g_sum -= stackIn.g - ( stackIn.g = src[p++]);
          b_sum -= stackIn.b - ( stackIn.b = src[p]);
          
          stackIn = stackIn.next;
        }
        yw += width;
      }

    
      for ( x = 0; x < width; x++ )
      {
        yi = x << 2;
        
        r_sum = radiusPlus1 * ( pr = src[yi++]);
        g_sum = radiusPlus1 * ( pg = src[yi++]);
        b_sum = radiusPlus1 * ( pb = src[yi]);
        
        stack = stackStart;
        
        for( i = 0; i < radiusPlus1; i++ )
        {
          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;
        }
        
        yp = width;
        
        for( i = 1; i <= this.radius; i++ )
        {
          yi = ( yp + x ) << 2;
          
          r_sum += ( stack.r = src[yi++]);
          g_sum += ( stack.g = src[yi++]);
          b_sum += ( stack.b = src[yi]);
          
          stack = stack.next;
        
          if ( i < heightMinus1 ) yp += width;
        }
        
        yi = x;
        stackIn = stackStart;
        for ( y = 0; y < height; y++ )
        {
          p = yi << 2;
          src[p]   = (r_sum * mul_sum) >>> shg_sum;
          src[p+1] = (g_sum * mul_sum) >>> shg_sum;
          src[p+2] = (b_sum * mul_sum) >>> shg_sum;
          
          p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
          
          r_sum -= stackIn.r - ( stackIn.r = src[p]);
          g_sum -= stackIn.g - ( stackIn.g = src[p+1]);
          b_sum -= stackIn.b - ( stackIn.b = src[p+2]);
          
          stackIn = stackIn.next;
          
        }
      }
    }

    var minInput = this.input.min/255
        ,maxInput = this.input.max/255
        ,minOutput = this.output.min/255
        ,maxOutput = this.output.max/255

    for (i = 0; i < src.length; i+=4) {
        r_sum = (255 - src[i]) * 0.5 + dst[i] * 0.5;
        g_sum = (255 - src[i+1]) * 0.5 + dst[i+1] * 0.5;
        b_sum = (255 - src[i+2]) * 0.5 + dst[i+2] * 0.5;
        // entsaettigen
        av = (r_sum + g_sum + b_sum) / 3;
        // tonwertkorrektur 
        av = (minOutput+(maxOutput-minOutput)*Pow(Min(Max((av/255)-minInput, 0.0) /  (maxInput-minInput), 1.0),(1/this.gamma)))*255;
        src[i] = src[i+1] = src[i+2] = 255 //av;
        // threshold anwenden
        src[i+3] = (av > this.threshold) ? 0 : 255;
    }


    context.putImageData(imageData, 0, 0);  
  },

  /**
   * @method toJSON
   * @return {String} json representation of filter
   */
  toJSON: function() {
    return {
      type: this.type,
    };
  }
});

fabric.Image.filters.Highpass.fromObject = function(object) {
  return new fabric.Image.filters.Highpass(object);
};
