var OVROOT = "http://uno:8084/OceanViewerPortlet/";
var OV_PREFERENCES_URL = "/portal/auth/portal/default/OceanViewer/wizardWindow_52?action=1";
var proxy = (window.PROXY_URL?window.PROXY_URL+"&urltoproxify=" :"") .replace("&amp;","&");
var proxyRemote = (window.PROXY_URL_REMOTE+"&urltoproxify=" || "") .replace("&amp;","&");
var list = [];

var xhr = new XMLHttpRequest();
xhr.onload = function(r,a){
   list = list.concat(JSON.parse(this.responseText).options);		
   list.get = function(id){var l = list.filter(function(el){return el.key==id})[0]; return l ? l.value : undefined;} 
}

xhr.open("GET", proxy + OVROOT + "services?service=config&action=getList",false);
xhr.send();

Ext.Ajax.disableCaching = false;

Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "/GISManagers/lib/GeoExt"
    }
});



Ext.onReady(function(){
    Ext.LoadMask && Ext.apply(Ext.LoadMask.prototype, {
        msg: 'Загрузка...'
    });
    Ext.view.AbstractView && Ext.apply(Ext.view.AbstractView.prototype, {
        loadingText: 'Загрузка...'
    });
     
    Ext.ux.grid && Ext.ux.grid.FiltersFeature && Ext.apply(Ext.ux.grid.FiltersFeature.prototype, {
        menuFilterText : "Фильтры"
    });
});
    
Ext.Error.handle = function(err) {
    var msg = err.msg;
    if (err.msg=="Error parsing WMS GetCapabilities") {
        msg = "Информация о слоях не может быть получена - запрашиваемый ресурс не найден";
    }
    window.setTimeout(function(){
        var w = new Ext.Window({
            title:'Ошибка',
            width: 350,
            //height:150,
            autoHeight: true,
            bodyStyle: "padding:10px",
            html: "При загрузке произошла ошибка",
            buttons: [
            {
                text: "OK", 
                handler: function(){ 
                    w.close();
                }
            },
            {
                text: "Подробнее...", 
                handler: function(){ 
                    w.close();
                    Ext.Msg.show({
                        title:'Подробная информация:',
                        width: 700,
                        msg:  msg
                    });
                }
            },
            ]
        }).show();
    },1000);
    return true;
};

window.CONFIG = {
    PROXY :  proxy, 
    PROXY_REMOTE :  proxyRemote, 
    OVROOT : OVROOT,
    ALIASE_URL : "translate",
    METADATA_URL : list.get("metadataUrl"),
    CACHE_URL : list.get("basemapUrl"),//"http://gis.esimo.ru/cache/service/wms",
    REST_URL : list.get("restUrl"),//"http://portal.esimo.ru/restserver/services/requests",
    GEOSERVER : list.get("geoserverRemoteURL")//"http://oceanviewer.ru/resources/"
}

window.OpenLayers && (OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3);

handleCapabilities = function(url,capsStore,cb) {
    var regexpRes = url && url.match(/\/\w*/g);
    if (regexpRes) {
            OpenLayers.Request.issue({
                    method: "GET",
                    url: OVROOT + "services",
                    async: true,
                    params:{
                            service: "layerDescription",
                            action: "getList",
                            workspace: regexpRes[regexpRes.length-2].replace("/","")
                    },
                    callback: function(request) {
                            var layers = JSON.parse(request.responseText).items;	
                            layers.forEach(function(el,idx) {
                                    capsStore.data.items.filter(function(e){
                                            return e.data.name == el.layername;
                                    }).forEach(function(elt) {
                                            elt.data.title = el.title;
                                            elt.data.abstract = el.description;																				
                                    });
                                    cb.call();
                            });
                    }
            });
    }
}