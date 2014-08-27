Ext.require([
    'GeoExt.panel.Map'
    ]);
    

var map, demolayer;                      
OpenLayers.DOTS_PER_INCH = 90.71428571428572;
OpenLayers.Util.onImageLoadErrorColor = 'transparent';


function getMap(o) {
    var mapOptions = {
        //resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981, 0.0023326729820109904, 0.0011663364910054952, 5.831682455027476E-4, 2.915841227513738E-4, 1.457920613756869E-4],
        projection: new OpenLayers.Projection(o.prj),
        //maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
        units: "meters"
    };
    map = new OpenLayers.Map(undefined, mapOptions);
    map.addControl(new OpenLayers.Control.Navigation());
    demolayer = new OpenLayers.Layer.WMS(
        "eko_merge", CONFIG.CACHE_URL,
        {
            layers: 'eko_merge', 
            format: 'image/png',
            SRS: o.prj
        },
        {
            tileSize: new OpenLayers.Size(256,256),
            wrapDateLine: true
        });
    map.addLayer(demolayer);
    return map;
}


Ext.define('Ext.gispro.ExtentPicker', {
    extend: 'Ext.Window',
    xtype: 'extentPicker',
    maximizable: true,
    width: 600,
    height: 600,
    tbar: [{
        text: 'Готово',
        handler: function() {
            this.up('.window').close()
        }
    }],
    initComponent: function() {
        var me = this;
        Ext.apply(this, {
            title: 'Предпросмотр',            
            listeners: {
                beforeclose: function() {
                    if (me.callback) {
                        me.callback.call(this, map.getExtent().toString());
                    }
                }
            },
            layout: 'fit',
            items: [
            Ext.create('GeoExt.panel.Map', {
                map: getMap({prj:this.projection}),
                center: '0.0,0.0',
                zoom: 2
            })
            ]
        });
        this.callParent(arguments);
    }
    
})