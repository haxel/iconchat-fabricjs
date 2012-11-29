fabric.Image.filters.Convolution = fabric.util.createClass( {
    /**
    * @param {String} type
    */
    type: "Convolution",
    
    initialize: function(options) {
        options || (options = { });
        this.matrix = options.matrix || 
            [[  0, 0, 0 ],
             [  0, 1, 0 ],
             [  0, 0, 0 ]]; // 3x3 matrix
        this.divisor = options.divisor || 0;
        this.offset = options.offset || 0;
    },

    /**
    * @method applyTo
    * @param {Object} canvasEl Canvas element to apply filter to
    */
    applyTo: function(canvasEl) {
        var context = canvasEl.getContext('2d');

        var m = [].concat(this.matrix[0], this.matrix[1], this.matrix[2]); // flatten
        if (!this.divisor) {
            this.divisor = m.reduce(function(a, b) {return a + b;}) || 1; // sum
        }

        var context = canvasEl.getContext('2d');
        var original = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
        var oldpx = original.data;
        var newdata = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
        var newpx = newdata.data
        var len = newpx.length;
        var res = 0;
        var w = canvasEl.width;
        for (var i = 0; i < len; i++) {
            if ((i + 1) % 4 === 0) {
                newpx[i] = oldpx[i];
                continue;
            }
            res = 0;
            var these = [
                oldpx[i - w * 4 - 4] || oldpx[i],
                oldpx[i - w * 4]     || oldpx[i],
                oldpx[i - w * 4 + 4] || oldpx[i],
                oldpx[i - 4]         || oldpx[i],
                oldpx[i],
                oldpx[i + 4]         || oldpx[i],
                oldpx[i + w * 4 - 4] || oldpx[i],
                oldpx[i + w * 4]     || oldpx[i],
                oldpx[i + w * 4 + 4] || oldpx[i]
            ];
            for (var j = 0; j < 9; j++) {
                res += these[j] * m[j];
            }
            res /= this.divisor;
            if (this.offset) {
                res += this.offset;
            }
            newpx[i] = res;
        }
        context.putImageData(newdata,0,0);
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

fabric.Image.filters.Convolution.fromObject = function(object) {
    return new fabric.Image.filters.Convolution(object);
};
